
import React, { useState, useCallback, useRef } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { Camera, Download, Trash2, Eye, Edit3, Image as ImageIcon, Upload, HelpCircle } from 'lucide-react';
import { toPng } from 'html-to-image';
import { TierId, TierItem, AppState } from './types';
import { TIER_CONFIGS, INITIAL_STATE } from './constants';

const App: React.FC = () => {
  const [state, setState] = useState<AppState>(INITIAL_STATE);
  const [isPreview, setIsPreview] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const tierListRef = useRef<HTMLDivElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files) as File[];
    
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const newItem: TierItem = {
          id: `img-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          url: event.target?.result as string,
          name: file.name
        };
        setState(prev => ({
          ...prev,
          [TierId.Pool]: [...prev[TierId.Pool], newItem]
        }));
      };
      reader.readAsDataURL(file);
    });
    // Reset input
    e.target.value = '';
  };

  const onDragEnd = (result: DropResult) => {
    const { source, destination } = result;
    if (!destination) return;

    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) {
      return;
    }

    const sourceId = source.droppableId as TierId;
    const destId = destination.droppableId as TierId;

    const sourceItems = [...state[sourceId]];
    const destItems = sourceId === destId ? sourceItems : [...state[destId]];
    
    const [removed] = sourceItems.splice(source.index, 1);
    destItems.splice(destination.index, 0, removed);

    setState(prev => ({
      ...prev,
      [sourceId]: sourceItems,
      [destId]: destItems
    }));
  };

  const removeItem = (tierId: TierId, index: number) => {
    setState(prev => {
      const newItems = [...prev[tierId]];
      newItems.splice(index, 1);
      return { ...prev, [tierId]: newItems };
    });
  };

  const clearAll = () => {
    if (window.confirm('确定要清空所有图片吗？')) {
      setState(INITIAL_STATE);
    }
  };

  const exportImage = async () => {
    if (tierListRef.current) {
      setIsExporting(true);
      try {
        // Ensure preview state is respected and layout is stable
        await new Promise(resolve => setTimeout(resolve, 300));

        const dataUrl = await toPng(tierListRef.current, {
          cacheBust: true,
          backgroundColor: '#0f172a',
          pixelRatio: 2, // Higher resolution output
          style: {
            padding: '20px',
            borderRadius: '12px'
          },
          // CRITICAL: skipFonts prevents html-to-image from attempting to read cross-origin 
          // CSS rules that cause "Cannot access rules" errors. We use system fonts instead.
          skipFonts: true,
        });
        
        const link = document.createElement('a');
        link.download = `tier-list-${Date.now()}.png`;
        link.href = dataUrl;
        link.click();
      } catch (err) {
        console.error('Export failed:', err);
        alert('生成图片失败。请确保页面加载完成，或尝试在非预览模式下重试。');
      } finally {
        setIsExporting(false);
      }
    }
  };

  return (
    <div className="min-h-screen p-4 md:p-8 flex flex-col items-center">
      {/* Header */}
      <header className="w-full max-w-5xl flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-600 rounded-lg shadow-lg shadow-indigo-500/30">
            <Camera className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
            锐评等级生成器
          </h1>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsPreview(!isPreview)}
            className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-full transition-all text-sm font-semibold border border-slate-700"
          >
            {isPreview ? <Edit3 className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            {isPreview ? '返回编辑' : '效果预览'}
          </button>
          
          <button
            onClick={exportImage}
            disabled={isExporting}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 rounded-full transition-all text-sm font-semibold shadow-lg shadow-indigo-600/20"
          >
            <Download className="w-4 h-4" />
            {isExporting ? '生成中...' : '下载图片'}
          </button>
        </div>
      </header>

      {/* Main Content */}
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="w-full max-w-5xl space-y-6">
          {/* Tier List Area */}
          <div 
            ref={tierListRef} 
            className={`rounded-xl overflow-hidden border border-slate-800 bg-slate-900/50 shadow-2xl transition-all ${isPreview ? 'p-6' : ''}`}
          >
            {TIER_CONFIGS.map((tier) => (
              <div key={tier.id} className="flex border-b border-slate-800 last:border-0 min-h-[100px]">
                <div className={`w-24 md:w-32 flex items-center justify-center text-center p-2 font-black ${tier.bgColor} ${tier.textColor} text-lg md:text-xl shadow-inner shrink-0`}>
                  {tier.label}
                </div>
                <Droppable droppableId={tier.id} direction="horizontal">
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`flex-grow flex flex-wrap gap-2 p-3 min-h-[100px] transition-colors ${
                        snapshot.isDraggingOver ? 'bg-indigo-500/10' : 'bg-transparent'
                      }`}
                    >
                      {state[tier.id].map((item, index) => (
                        <Draggable key={item.id} draggableId={item.id} index={index}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className={`relative group w-20 h-20 md:w-24 md:h-24 rounded-md overflow-hidden bg-slate-800 border border-slate-700 shadow-md ${
                                snapshot.isDragging ? 'ring-2 ring-indigo-400 z-50' : ''
                              }`}
                            >
                              <img src={item.url} alt={item.name} className="w-full h-full object-cover" />
                              {!isPreview && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    removeItem(tier.id, index);
                                  }}
                                  className="absolute top-1 right-1 p-1 bg-red-600/80 hover:bg-red-600 rounded-md opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                  <Trash2 className="w-3 h-3 text-white" />
                                </button>
                              )}
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </div>
            ))}
          </div>

          {/* Controls & Pool - Only visible when NOT in preview */}
          {!isPreview && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="flex flex-wrap gap-2">
                  <label className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 rounded-xl cursor-pointer transition-all shadow-lg shadow-indigo-600/30 group">
                    <Upload className="w-5 h-5 group-hover:-translate-y-1 transition-transform" />
                    <span className="font-bold">上传待锐评图片</span>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                  <button
                    onClick={clearAll}
                    className="flex items-center gap-2 px-6 py-3 bg-slate-800 hover:bg-red-900/40 hover:text-red-400 rounded-xl transition-all border border-slate-700"
                  >
                    <Trash2 className="w-5 h-5" />
                    <span className="font-bold">全部清空</span>
                  </button>
                </div>
                
                <div className="flex items-center text-slate-400 text-sm italic">
                  <HelpCircle className="w-4 h-4 mr-2" />
                  拖动图片到上方等级，点击预览确认效果
                </div>
              </div>

              {/* Pool Container */}
              <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 min-h-[200px] shadow-xl backdrop-blur-sm">
                <div className="flex items-center gap-2 mb-6 border-b border-slate-800 pb-4">
                  <ImageIcon className="w-5 h-5 text-indigo-400" />
                  <h2 className="text-lg font-bold">待评价列表 ({state[TierId.Pool].length})</h2>
                </div>
                
                <Droppable droppableId={TierId.Pool} direction="horizontal">
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`flex flex-wrap gap-4 min-h-[120px] p-2 transition-all rounded-xl ${
                        snapshot.isDraggingOver ? 'bg-indigo-500/5' : ''
                      }`}
                    >
                      {state[TierId.Pool].length === 0 && (
                        <div className="w-full flex flex-col items-center justify-center text-slate-500 py-8 border-2 border-dashed border-slate-800 rounded-xl">
                          <ImageIcon className="w-12 h-12 mb-2 opacity-20" />
                          <p>暂无图片，请点击上方按钮上传</p>
                        </div>
                      )}
                      {state[TierId.Pool].map((item, index) => (
                        <Draggable key={item.id} draggableId={item.id} index={index}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className={`relative group w-24 h-24 md:w-32 md:h-32 rounded-xl overflow-hidden bg-slate-800 border-2 border-slate-700 shadow-xl transition-all ${
                                snapshot.isDragging ? 'scale-110 shadow-indigo-500/50 rotate-3 ring-4 ring-indigo-500 z-50' : 'hover:border-indigo-500 hover:-translate-y-1'
                              }`}
                            >
                              <img src={item.url} alt={item.name} className="w-full h-full object-cover" />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2">
                                <p className="text-[10px] text-white truncate w-full">{item.name}</p>
                              </div>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  removeItem(TierId.Pool, index);
                                }}
                                className="absolute top-1 right-1 p-1 bg-red-600/80 hover:bg-red-600 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <Trash2 className="w-4 h-4 text-white" />
                              </button>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </div>
            </div>
          )}
        </div>
      </DragDropContext>

      {/* Footer */}
      <footer className="mt-12 text-slate-500 text-sm">
        © {new Date().getFullYear()} 锐评工具 · 做出你的终极等级图
      </footer>
    </div>
  );
};

export default App;
