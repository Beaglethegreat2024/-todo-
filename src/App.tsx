import React, { useState, useEffect } from 'react';
import { Task, BeadPet, GachaItem, PlacedDecoration, AppState } from './types';
import { DEFAULT_PET, GACHA_ITEMS } from './data';
import { pixelateImage } from './lib/pixelator';
import MacWindow from './components/MacWindow';
import BeadPetRenderer from './components/BeadPetRenderer';
import PetRoom from './components/PetRoom';
import GachaSystem from './components/GachaSystem';
import {
  Plus,
  Check,
  Trash2,
  Upload,
  Sparkles,
  Ticket,
  Shirt,
  Home,
  FileText,
  Calendar,
  Layers,
  ArrowRight,
  Info,
  Clock,
  Laptop
} from 'lucide-react';

const LOCAL_STORAGE_KEY = 'perler_bead_pet_state_v1';

export default function App() {
  // --- Core State Variables ---
  const [tasks, setTasks] = useState<Task[]>([]);
  const [tickets, setTickets] = useState<number>(3); // Give 3 default draw tickets for onboarding!
  const [pet, setPet] = useState<BeadPet>(DEFAULT_PET);
  const [unlockedOutfits, setUnlockedOutfits] = useState<string[]>(['glass_cool']); // Glass_cool unlocked by default
  const [unlockedDecorations, setUnlockedDecorations] = useState<string[]>(['dec_plant', 'dec_plush_bear']); // Default unlocked decor
  const [placedDecorations, setPlacedDecorations] = useState<PlacedDecoration[]>([]);
  const [animationState, setAnimationState] = useState<'idle' | 'float' | 'bounce' | 'wave'>('float');
  const [taskInput, setTaskInput] = useState<string>('');
  
  // UI states
  const [uploadLoading, setUploadLoading] = useState<boolean>(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'home' | 'dressup' | 'gacha'>('home');
  const [currentTime, setCurrentTime] = useState<string>('');
  const [pixelationMode, setPixelationMode] = useState<'ai' | 'local'>('ai');

  // --- Load State from LocalStorage ---
  useEffect(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        const parsed: AppState = JSON.parse(saved);
        if (parsed.tasks) setTasks(parsed.tasks);
        if (typeof parsed.tickets === 'number') setTickets(parsed.tickets);
        if (parsed.pet) setPet(parsed.pet);
        if (parsed.unlockedOutfits) setUnlockedOutfits(parsed.unlockedOutfits);
        if (parsed.unlockedDecorations) setUnlockedDecorations(parsed.unlockedDecorations);
        if (parsed.placedDecorations) setPlacedDecorations(parsed.placedDecorations);
      }
    } catch (e) {
      console.error('Failed to parse localStorage state:', e);
    }
  }, []);

  // --- Save State to LocalStorage ---
  useEffect(() => {
    const stateToSave: AppState = {
      tasks,
      tickets,
      unlockedOutfits,
      unlockedDecorations,
      placedDecorations,
      pet,
      activeOutfitId: pet?.activeOutfitId || null,
      gachaHistory: []
    };
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(stateToSave));
  }, [tasks, tickets, unlockedOutfits, unlockedDecorations, placedDecorations, pet]);

  // --- Hunger Decay & Offline sync ---
  useEffect(() => {
    if (!pet) return;
    
    // 1. On mount, check offline elapsed hunger loss
    const now = Date.now();
    const lastTime = pet.lastInteracted || now;
    const elapsedMs = now - lastTime;
    
    // 5 hunger points per hour (1 point per 12 mins)
    const decayPoints = Math.floor(elapsedMs / (12 * 60 * 1000));
    if (decayPoints > 0) {
      setPet((prev) => {
        if (!prev) return prev;
        const currentHunger = prev.hunger !== undefined ? prev.hunger : 100;
        return {
          ...prev,
          hunger: Math.max(0, currentHunger - decayPoints),
          lastInteracted: now
        };
      });
    }
  }, []);

  // 2. Continuous active decay (1 point every 30 seconds)
  useEffect(() => {
    const interval = setInterval(() => {
      setPet((prev) => {
        if (!prev) return prev;
        const currentHunger = prev.hunger !== undefined ? prev.hunger : 100;
        if (currentHunger <= 0) return prev;
        return {
          ...prev,
          hunger: Math.max(0, currentHunger - 1)
        };
      });
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  // --- Clock logic ---
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString('zh-CN', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // --- To-Do Handlers ---
  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskInput.trim()) return;

    const newTask: Task = {
      id: `task_${Date.now()}`,
      text: taskInput.trim(),
      completed: false,
      createdAt: new Date().toISOString()
    };

    setTasks([newTask, ...tasks]);
    setTaskInput('');
  };

  const handleToggleTask = (id: string) => {
    setTasks(
      tasks.map((t) => {
        if (t.id === id) {
          const isCompletedNow = !t.completed;
          if (isCompletedNow) {
            // Checked task awards 1 ticket!
            setTickets((prev) => prev + 1);

            // Reward pet with +15 hunger when user completes a task!
            setPet((prevPet) => {
              if (!prevPet) return prevPet;
              const currentHunger = prevPet.hunger !== undefined ? prevPet.hunger : 100;
              return {
                ...prevPet,
                hunger: Math.min(100, currentHunger + 15),
                lastInteracted: Date.now()
              };
            });

            return {
              ...t,
              completed: true,
              completedAt: new Date().toISOString()
            };
          } else {
            // Uncompleted task doesn't penalize, but we keep ticket balance
            return {
              ...t,
              completed: false,
              completedAt: undefined
            };
          }
        }
        return t;
      })
    );
  };

  const handleDeleteTask = (id: string) => {
    setTasks(tasks.filter((t) => t.id !== id));
  };

  const handleClearCompleted = () => {
    setTasks(tasks.filter((t) => !t.completed));
  };

  // --- Upload Idol Image & Pixelation ---
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadLoading(true);
    setUploadError(null);

    // Convert file to Base64
    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64Data = event.target?.result as string;
      if (!base64Data) {
        setUploadError('读取文件数据失败');
        setUploadLoading(false);
        return;
      }

      const mimeType = file.type;
      // Extract clean base64 string
      const rawBase64 = base64Data.split(',')[1];

      if (pixelationMode === 'ai') {
        try {
          // AI Mode: Call full-stack endpoint
          const response = await fetch('/api/generate-bead-pet', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              imageBase64: rawBase64,
              mimeType: mimeType
            })
          });

          if (!response.ok) {
            const errData = await response.json();
            throw new Error(errData.error || 'AI转换拼豆请求失败');
          }

          const data = await response.json();
          if (data.success && data.pet) {
            setPet({
              ...data.pet,
              originalImage: base64Data,
              useOriginalImage: true
            });
          } else {
            throw new Error(data.error || '返回的拼豆数据不合法');
          }
        } catch (error: any) {
          console.error('AI conversion failed:', error);
          setUploadError(`AI生成失败: ${error.message}。正在为您切换到本地算法进行转换...`);
          // Failover to local canvas-based pixelator
          try {
            const grid = await pixelateImage(base64Data, 16);
            setPet({
              name: '我的专属拼豆',
              description: '使用本地高精渲染引擎瞬间生成的拼豆伙伴！加油完成待办吧！',
              gridSize: 16,
              beadGrid: grid,
              originalImage: base64Data,
              activeOutfitId: null,
              useOriginalImage: true
            });
          } catch (localErr: any) {
            setUploadError(`本地渲染也失败: ${localErr.message}`);
          }
        } finally {
          setUploadLoading(false);
        }
      } else {
        // Local Canvas Mode
        try {
          const grid = await pixelateImage(base64Data, 16);
          setPet({
            name: file.name.split('.')[0] || '我的自推拼豆',
            description: '基于自选图片快速生成的16x16拼豆萌宠。在桌面上常驻陪伴你！',
            gridSize: 16,
            beadGrid: grid,
            originalImage: base64Data,
            activeOutfitId: null,
            useOriginalImage: true
          });
        } catch (localErr: any) {
          setUploadError(`本地生成失败: ${localErr.message}`);
        } finally {
          setUploadLoading(false);
        }
      }
    };

    reader.onerror = () => {
      setUploadError('文件读取发生错误');
      setUploadLoading(false);
    };

    reader.readAsDataURL(file);
  };

  // --- Outfit Selection Handler ---
  const handleSelectOutfit = (outfitId: string | null) => {
    setPet((prev) => ({
      ...prev,
      activeOutfitId: outfitId
    }));
  };

  // --- Gacha Rewards Callback ---
  const handleDrawSuccess = (item: GachaItem, refundTicket: boolean) => {
    // Subtract 1 ticket
    setTickets((prev) => prev - 1);

    if (refundTicket) {
      // Refund duplicated ticket
      setTimeout(() => {
        setTickets((prev) => prev + 1);
      }, 1000);
      return;
    }

    // Add new unlocked item
    if (item.type === 'outfit') {
      setUnlockedOutfits((prev) => [...prev, item.id]);
    } else {
      setUnlockedDecorations((prev) => [...prev, item.id]);
    }
  };

  const completedCount = tasks.filter((t) => t.completed).length;
  const progressPercent = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;

  return (
    <div className="min-h-screen bg-[#f8f1ff] bead-bg text-[#2d3436] flex flex-col font-sans select-none overflow-x-hidden pb-12">
      {/* --- macOS Status Menu Bar --- */}
      <header className="h-11 bg-white border-b-4 border-[#2d3436] flex items-center justify-between px-4 text-xs font-bold z-40 shadow-[0_4px_0_rgba(0,0,0,0.05)] text-[#2d3436]">
        <div className="flex items-center space-x-5">
          <div className="flex items-center space-x-1.5 cursor-pointer hover:text-[#ff7eb6] transition-colors">
            <Laptop className="w-4 h-4 text-[#ff7eb6] animate-pulse" />
            <span className="font-display font-black tracking-tight uppercase">BeadPetOS_v1.0</span>
          </div>
          <div className="hidden sm:flex space-x-4 text-slate-500 font-bold">
            <span className="hover:text-[#2d3436] cursor-pointer">文件(F)</span>
            <span className="hover:text-[#2d3436] cursor-pointer">编辑(E)</span>
            <span className="hover:text-[#2d3436] cursor-pointer">动作(A)</span>
            <span className="hover:text-[#2d3436] cursor-pointer">关于(H)</span>
          </div>
        </div>

        {/* Global Widget Status & Time */}
        <div className="flex items-center space-x-4 text-slate-600 font-bold">
          <div className="flex items-center gap-1.5 bg-[#ff7eb6]/15 px-3 py-1 rounded-lg border-2 border-[#2d3436] text-[#2d3436] shadow-[2px_2px_0_#2d3436]">
            <Ticket className="w-3.5 h-3.5 text-[#ff7eb6]" />
            <span className="font-mono text-[10px] font-bold">{tickets} 抽奖券</span>
          </div>
          
          <div className="hidden md:flex items-center gap-1 bg-[#55efc4]/15 px-2 py-1 rounded-lg border-2 border-[#2d3436] text-[#2d3436]">
            <span className="w-2 h-2 rounded-full bg-[#55efc4] border border-black animate-pulse"></span>
            <span className="text-[10px] font-bold font-mono">桌宠在线陪同</span>
          </div>

          <div className="flex items-center space-x-1.5 font-mono text-[#2d3436]">
            <Clock className="w-3.5 h-3.5 text-[#2d3436]" />
            <span>{currentTime}</span>
          </div>
        </div>
      </header>

      {/* --- Main Desktop Work Area --- */}
      <main className="flex-grow w-full max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* ================= COLUMN 1: TO-DO MANAGER (macOS Left Panel) ================= */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <MacWindow
            title="🎯 每日待办事项"
            subtitle="Daily Task Quest Log"
            headerActions={
              <div className="flex items-center gap-1.5 text-[10px] text-white font-bold bg-[#ff7eb6] border-2 border-[#2d3436] px-2.5 py-0.5 rounded-lg shadow-[2px_2px_0_#2d3436]">
                <Calendar className="w-3.5 h-3.5" />
                <span className="uppercase font-mono">TODAY</span>
              </div>
            }
            className="w-full"
          >
            {/* Input Form */}
            <form onSubmit={handleAddTask} className="flex gap-2.5 mb-4">
              <input
                type="text"
                value={taskInput}
                onChange={(e) => setTaskInput(e.target.value)}
                placeholder="添加一个新的每日任务..."
                className="flex-grow bg-white border-3 border-[#2d3436] rounded-xl px-3.5 py-2 text-xs font-bold text-[#2d3436] focus:outline-none focus:border-[#ff7eb6] shadow-[2.5px_2.5px_0_#2d3436] transition-all placeholder:text-slate-400"
              />
              <button
                type="submit"
                className="pixel-btn px-4 rounded-xl flex items-center justify-center font-bold text-sm bg-[#ff7eb6]"
              >
                <Plus className="w-4.5 h-4.5 stroke-[3px]" />
              </button>
            </form>

            {/* Daily progress statistics */}
            <div className="bg-[#f8f1ff] border-3 border-[#2d3436] p-4 rounded-xl mb-4 flex flex-col gap-2.5 shadow-[3.5px_3.5px_0_#2d3436]">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-600 font-bold uppercase tracking-wide">🏆 今日Quest进度:</span>
                <span className="font-mono text-[#ff7eb6] font-black text-sm">
                  {completedCount}/{tasks.length} ({progressPercent}%)
                </span>
              </div>
              <div className="w-full bg-slate-100 h-3.5 rounded-full border-2 border-[#2d3436] overflow-hidden">
                <div
                  className="bg-[#55efc4] border-r-2 border-[#2d3436] h-full transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <span className="text-[9.5px] text-[#2d3436] font-bold leading-snug flex items-start gap-1.5 bg-white border-2 border-[#2d3436] p-2 rounded-lg mt-0.5">
                <Sparkles className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                <span>每打勾完成一个事项，即刻获得 1 张抽奖券！</span>
              </span>
            </div>

            {/* Task Checklist list */}
            <div className="flex-1 min-h-[220px] max-h-[380px] overflow-y-auto flex flex-col gap-3 pr-1">
              {tasks.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center py-10 border-2 border-dashed border-slate-300 rounded-xl text-center bg-slate-50/50">
                  <FileText className="w-9 h-9 text-slate-400 mb-2" />
                  <span className="text-xs text-[#2d3436] font-bold">今天还没有待办事项哦</span>
                  <span className="text-[10px] text-slate-500 mt-1 uppercase font-mono">Input task and roll!</span>
                </div>
              ) : (
                tasks.map((task) => (
                  <div
                    key={task.id}
                    className={`flex items-center justify-between p-3 rounded-xl border-3 transition-all ${
                      task.completed
                        ? 'bg-slate-50/70 border-slate-300 opacity-60 line-through text-slate-400'
                        : 'bg-white border-[#2d3436] shadow-[2.5px_2.5px_0_#2d3436] hover:translate-y-[-1px] hover:shadow-[3.5px_3.5px_0_#2d3436]'
                    }`}
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <button
                        onClick={() => handleToggleTask(task.id)}
                        className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                          task.completed
                            ? 'bg-[#55efc4] border-black text-black'
                            : 'border-[#2d3436] hover:border-[#ff7eb6] bg-white'
                        }`}
                      >
                        {task.completed && <Check className="w-3.5 h-3.5 stroke-[3px]" />}
                      </button>
                      <span className="text-xs truncate font-bold">
                        {task.text}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {task.completed && (
                        <span className="px-2 py-0.5 bg-[#ff7eb6] border-2 border-black text-[8px] text-white rounded-lg font-black font-mono animate-pulse uppercase">
                          券+1
                        </span>
                      )}
                      <button
                        onClick={() => handleDeleteTask(task.id)}
                        className="text-slate-400 hover:text-rose-500 p-1 rounded-md transition-all hover:scale-110 active:scale-90"
                        title="删除任务"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Clear completed button */}
            {completedCount > 0 && (
              <button
                onClick={handleClearCompleted}
                className="mt-4 text-center w-full py-2.5 bg-white border-3 border-[#2d3436] text-[#2d3436] hover:bg-slate-50 font-bold rounded-xl text-[10px] shadow-[3px_3px_0_#2d3436] active:translate-y-[2px] active:shadow-[1px_1px_0_#2d3436] transition-all"
              >
                清理已完成任务 Quest
              </button>
            )}
          </MacWindow>

          {/* Upload and Generation Panel */}
          <MacWindow
            title="✨ 自推拼豆生成站"
            subtitle="Upload & Pixelate Studio"
            headerActions={
              <div className="flex gap-1.5 bg-[#f8f1ff] p-1 border-2 border-[#2d3436] rounded-xl">
                <button
                  onClick={() => setPixelationMode('ai')}
                  className={`px-2 py-0.5 rounded-lg text-[9px] font-bold transition-all uppercase ${
                    pixelationMode === 'ai'
                      ? 'bg-[#ff7eb6] text-white border border-[#2d3436]'
                      : 'text-slate-500 hover:text-[#2d3436]'
                  }`}
                  title="使用Gemini模型智能生成"
                >
                  AI转换
                </button>
                <button
                  onClick={() => setPixelationMode('local')}
                  className={`px-2 py-0.5 rounded-lg text-[9px] font-bold transition-all uppercase ${
                    pixelationMode === 'local'
                      ? 'bg-[#ff7eb6] text-white border border-[#2d3436]'
                      : 'text-slate-500 hover:text-[#2d3436]'
                  }`}
                  title="使用本地Canvas高效转换"
                >
                  本地精细
                </button>
              </div>
            }
          >
            <div className="flex flex-col gap-4 text-[#2d3436]">
              <p className="text-[10px] text-slate-500 leading-normal font-bold">
                上传一张偶像、手办或自制立绘，立即转换成 Perler Bead 拼豆桌宠！
              </p>

              <div className="relative border-3 border-dashed border-[#2d3436] hover:border-[#ff7eb6] rounded-xl p-5 flex flex-col items-center justify-center text-center bg-slate-50/50 hover:bg-[#f8f1ff]/30 transition-colors group">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={uploadLoading}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />

                <Upload className="w-8 h-8 text-slate-400 group-hover:text-[#ff7eb6] transition-colors mb-2" />
                <span className="text-xs font-bold text-[#2d3436]">点击或拖拽上传自推图片</span>
                <span className="text-[9px] text-slate-400 mt-1 uppercase font-mono">PNG, JPG, WEBP (1:1 Ratio Best)</span>
              </div>

              {uploadLoading && (
                <div className="bg-[#f8f1ff] border-3 border-[#2d3436] p-4 rounded-xl flex flex-col items-center justify-center gap-2.5 shadow-[3px_3px_0_#2d3436]">
                  <div className="w-6 h-6 rounded-full border-3 border-[#ff7eb6] border-t-transparent animate-spin" />
                  <span className="text-[10px] text-[#2d3436] font-bold animate-pulse text-center leading-relaxed">
                    {pixelationMode === 'ai'
                      ? '🤖 正在召唤 Gemini AI 提取拼豆网格、配饰、名称及背景故事...'
                      : '⚡ 正在使用本地 Canvas 精细提取拼豆像素网格...'}
                  </span>
                </div>
              )}

              {uploadError && (
                <div className="bg-rose-50 border-2 border-rose-500/50 p-2.5 rounded-xl text-[9px] text-rose-600 font-bold leading-normal">
                  ⚠️ {uploadError}
                </div>
              )}

              <div className="flex items-start gap-2.5 bg-[#70d6ff]/10 border-3 border-[#2d3436] p-3.5 rounded-xl shadow-[3px_3px_0_#2d3436]">
                <Info className="w-5 h-5 text-[#ff7eb6] flex-shrink-0 mt-0.5" />
                <div className="flex flex-col">
                  <span className="text-[11px] font-black text-[#2d3436] uppercase tracking-wide">
                    当前正在陪同: {pet.name}
                  </span>
                  <p className="text-[9px] text-slate-600 mt-1 leading-relaxed">
                    {pet.description}
                  </p>
                </div>
              </div>
            </div>
          </MacWindow>
        </div>

        {/* ================= COLUMN 2: PET HOUSING CABINET & DRESSUP (macOS Central Panel) ================= */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          {/* Main Visual Workspace Area */}
          <MacWindow
            title={`🧸 桌宠互动面板 － ${pet.name}`}
            subtitle="Virtual Desktop Interaction Cabinet"
            headerActions={
              <div className="flex gap-1 bg-[#f8f1ff] p-1 border-3 border-[#2d3436] rounded-xl shadow-[2px_2px_0_#2d3436]">
                {(['home', 'dressup', 'gacha'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-3 py-1 text-[10px] font-black rounded-lg transition-all uppercase flex items-center gap-1 ${
                      activeTab === tab
                        ? 'bg-[#ff7eb6] text-white border border-[#2d3436]'
                        : 'text-slate-500 hover:text-[#2d3436]'
                    }`}
                  >
                    {tab === 'home' ? (
                      <>
                        <Home className="w-3.5 h-3.5" />
                        自推的小家
                      </>
                    ) : tab === 'dressup' ? (
                      <>
                        <Shirt className="w-3.5 h-3.5" />
                        配饰衣帽间
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5" />
                        扭蛋祈愿
                      </>
                    )}
                  </button>
                ))}
              </div>
            }
            className="flex-1"
          >
            {/* View Tab Content */}
            {activeTab === 'home' && (
              <PetRoom
                pet={pet}
                placedDecorations={placedDecorations}
                unlockedDecorations={unlockedDecorations}
                animationState={animationState}
                onUpdateDecorations={setPlacedDecorations}
                onUpdatePet={setPet}
              />
            )}

            {activeTab === 'dressup' && (
              <div className="flex flex-col md:flex-row gap-6 h-full items-center justify-between py-4 text-[#2d3436]">
                {/* Visualizer Frame */}
                <div className="flex flex-col items-center justify-center bg-white p-6 rounded-2xl border-4 border-[#2d3436] shadow-[4px_4px_0_#2d3436] bead-bg min-w-[220px]">
                  <BeadPetRenderer pet={pet} animationState={animationState} size={180} />
                  <span className="text-[10px] font-black text-[#2d3436] uppercase mt-4 bg-white border border-[#2d3436] px-2 py-0.5 rounded-full shadow-[2px_2px_0_#2d3436] font-mono">
                    STYLE: {pet.activeOutfitId ? GACHA_ITEMS.find(i=>i.id === pet.activeOutfitId)?.name : '经典经典'}
                  </span>
                </div>

                {/* Wardrobe Drawer */}
                <div className="flex-1 w-full flex flex-col gap-4">
                  <div>
                    <h3 className="text-xs font-bold text-[#2d3436] flex items-center gap-1.5 uppercase tracking-wide">
                      <Shirt className="w-4.5 h-4.5 text-[#ff7eb6]" />
                      <span>🎩 自推的配饰衣帽间 Closet</span>
                    </h3>
                    <p className="text-[10px] text-slate-500 mt-0.5">
                      (已解锁 {unlockedOutfits.length} 款衣服配饰)
                    </p>
                  </div>

                  {/* Wardrobe Cabinets lists */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-[220px] overflow-y-auto pr-1">
                    {/* Default Naked style */}
                    <button
                      onClick={() => handleSelectOutfit(null)}
                      className={`p-2 rounded-xl border-3 flex items-center gap-2.5 text-left transition-all ${
                        pet.activeOutfitId === null
                          ? 'bg-white border-[#2d3436] shadow-[3px_3px_0_#ff7eb6] translate-y-[-1px]'
                          : 'bg-white border-[#2d3436] shadow-[2.5px_2.5px_0_#2d3436] hover:translate-y-[-0.5px] hover:shadow-[3px_3px_0_#2d3436]'
                      }`}
                    >
                      <span className="text-2xl filter grayscale brightness-75">🧹</span>
                      <div className="flex flex-col">
                        <span className="text-[10px] font-black text-[#2d3436]">初始萌态</span>
                        <span className="text-[8px] text-slate-500 font-bold uppercase">Classic</span>
                      </div>
                    </button>

                    {GACHA_ITEMS.filter((item) => item.type === 'outfit' && unlockedOutfits.includes(item.id)).map((item) => (
                      <button
                        key={item.id}
                        onClick={() => handleSelectOutfit(item.id)}
                        className={`p-2 rounded-xl border-3 flex items-center gap-2.5 text-left transition-all ${
                          pet.activeOutfitId === item.id
                            ? 'bg-white border-[#2d3436] shadow-[3px_3px_0_#ff7eb6] translate-y-[-1px]'
                            : 'bg-white border-[#2d3436] shadow-[2.5px_2.5px_0_#2d3436] hover:translate-y-[-0.5px] hover:shadow-[3px_3px_0_#2d3436]'
                        }`}
                        title={item.description}
                      >
                        <span className="text-2xl filter drop-shadow-[0_2px_2px_rgba(0,0,0,0.25)]">
                          {item.icon}
                        </span>
                        <div className="flex flex-col">
                          <span className="text-[10px] font-black text-[#2d3436] truncate max-w-[80px]">
                            {item.name}
                          </span>
                          <span className={`text-[8px] font-bold uppercase mt-0.5 ${
                            item.rarity === 'epic' ? 'text-purple-600' : item.rarity === 'rare' ? 'text-amber-600' : 'text-slate-500'
                          }`}>
                            {item.rarity}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>

                  {/* Actions Animations Selector */}
                  <div className="border-t-4 border-dashed border-[#2d3436] pt-5 mt-3">
                    <h4 className="text-xs font-bold text-[#2d3436] mb-3 flex items-center gap-1.5 uppercase tracking-wide">
                      <Layers className="w-4.5 h-4.5 text-[#ff7eb6]" />
                      <span>💃 交互悬浮动作 Anims</span>
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {([
                        { id: 'idle', label: '安静呼吸' },
                        { id: 'float', label: '轻盈漂浮' },
                        { id: 'bounce', label: '软绵跳跃' },
                        { id: 'wave', label: '元气摇摆' }
                      ] as const).map((anim) => (
                        <button
                          key={anim.id}
                          onClick={() => setAnimationState(anim.id)}
                          className={`px-3 py-2 text-[10px] font-bold uppercase rounded-xl border-2 border-[#2d3436] transition-all shadow-[2.5px_2.5px_0_#2d3436] active:translate-y-[1.5px] active:shadow-[1px_1px_0_#2d3436] ${
                            animationState === anim.id
                              ? 'bg-[#70d6ff] text-[#2d3436] translate-y-[-1px]'
                              : 'bg-white text-[#2d3436] hover:bg-slate-50'
                          }`}
                        >
                          {anim.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'gacha' && (
              <GachaSystem
                tickets={tickets}
                unlockedOutfits={unlockedOutfits}
                unlockedDecorations={unlockedDecorations}
                onDrawSuccess={handleDrawSuccess}
              />
            )}
          </MacWindow>
        </div>
      </main>
    </div>
  );
}
