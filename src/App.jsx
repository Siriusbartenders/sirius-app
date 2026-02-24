import React, { useState, useEffect } from 'react';
import {
    Calculator,
    Package,
    Euro,
    Info,
    Plus,
    Trash2,
    Coffee,
    Lock,
    ChevronRight,
    Droplet,
    RefreshCw,
    Search,
    Minus,
    Calendar,
    Edit3,
    X,
    TrendingUp,
    AlertCircle,
    ArrowUpDown,
    Save,
    Settings,
    UserPlus
} from 'lucide-react';

// --- Sub-components ---

const UnitConverter = () => {
    const [value, setValue] = useState('');
    const [fromUnit, setFromUnit] = useState('ml');
    const [toUnit, setToUnit] = useState('oz');

    const convert = (val, from, to) => {
        if (!val) return 0;
        let ml = val;
        if (from === 'oz') ml = val * 29.57;
        if (from === 'cl') ml = val * 10;

        if (to === 'ml') return ml;
        if (to === 'oz') return ml / 29.57;
        if (to === 'cl') return ml / 10;
        return ml;
    };

    const swapUnits = () => {
        setFromUnit(toUnit);
        setToUnit(fromUnit);
    };

    const result = convert(parseFloat(value), fromUnit, toUnit);

    return (
        <div className="card border-orange-500/30">
            <h3 className="flex items-center gap-2 mb-6"><RefreshCw size={20} className="text-orange-500" /> Convertidor</h3>
            <div className="grid grid-cols-[1fr_44px_1fr] gap-4 items-start">
                <div className="space-y-3">
                    <input
                        type="number"
                        placeholder="0"
                        value={value}
                        onChange={e => setValue(e.target.value)}
                        className="w-full text-center h-14 bg-white/5 border border-gray-800 rounded-xl font-black text-white text-xl focus:border-orange-500 focus:outline-none transition-all"
                    />
                    <select value={fromUnit} onChange={e => setFromUnit(e.target.value)} className="w-full h-11 text-[10px] uppercase font-black bg-white/5 border-none rounded-xl">
                        <option value="ml">ml</option>
                        <option value="cl">cl</option>
                        <option value="oz">oz</option>
                    </select>
                </div>

                <div className="flex justify-center pt-1.5">
                    <button onClick={swapUnits} className="w-11 h-11 bg-orange-500/10 text-orange-500 rounded-full hover:bg-orange-500 hover:text-black transition-all border border-orange-500/20">
                        <ArrowUpDown size={18} />
                    </button>
                </div>

                <div className="space-y-3">
                    <input
                        type="number"
                        readOnly
                        placeholder="0"
                        value={result ? parseFloat(result.toFixed(1)) : ''}
                        className="w-full text-center h-14 bg-white/5 border border-gray-800 rounded-xl font-black text-orange-500 text-xl focus:outline-none"
                    />
                    <select value={toUnit} onChange={e => setToUnit(e.target.value)} className="w-full h-11 text-[10px] uppercase font-black bg-white/5 border-none rounded-xl">
                        <option value="ml">ml</option>
                        <option value="cl">cl</option>
                        <option value="oz">oz</option>
                    </select>
                </div>
            </div>
        </div>
    );
};

const BatchingCalculator = () => {
    const [mode, setMode] = useState('services');
    const [ingredients, setIngredients] = useState([{ name: '', amount: '', unit: 'ml' }]);
    const [servicesCount, setServicesCount] = useState(1);
    const [targetCapacity, setTargetCapacity] = useState(700);
    const [classics, setClassics] = useState(() => {
        const saved = localStorage.getItem('sirius_presets');
        return saved ? JSON.parse(saved) : [];
    });

    const [editingPreset, setEditingPreset] = useState(null);

    useEffect(() => {
        localStorage.setItem('sirius_presets', JSON.stringify(classics));
    }, [classics]);

    const [recipeName, setRecipeName] = useState('');

    const saveCurrentAsPreset = () => {
        const name = recipeName || prompt('Nombre del cóctel:', editingPreset?.name || '');
        if (!name) return;

        const newPreset = {
            id: editingPreset ? editingPreset.id : Date.now(),
            name,
            recipe: ingredients.filter(i => i.name && i.amount).map(i => ({ name: i.name, amount: parseFloat(i.amount) }))
        };

        if (editingPreset) {
            setClassics(classics.map(c => c.id === editingPreset.id ? newPreset : c));
        } else {
            setClassics([...classics, newPreset]);
        }
        setEditingPreset(null);
        setRecipeName('');
    };

    const loadClassic = (preset) => {
        setIngredients(preset.recipe.map(r => ({ ...r, unit: 'ml' })));
        setRecipeName(preset.name);
    };

    const deletePreset = (e, id) => {
        e.stopPropagation();
        if (window.confirm('¿Eliminar este cóctel?')) {
            setClassics(classics.filter(c => c.id !== id));
        }
    };

    const addIngredient = () => setIngredients([...ingredients, { name: '', amount: '', unit: 'ml' }]);
    const updateIngredient = (index, field, value) => {
        const next = [...ingredients];
        next[index][field] = value;
        setIngredients(next);
    };
    const removeIngredient = (index) => setIngredients(ingredients.filter((_, i) => i !== index));

    const totalRecipeMl = ingredients.reduce((acc, curr) => acc + (parseFloat(curr.amount) || 0), 0);

    let results = null;
    const batchTotal = mode === 'services' ? totalRecipeMl * servicesCount : targetCapacity;

    if (mode === 'services') {
        const dilution = batchTotal * 0.15;
        results = {
            items: ingredients.map(ing => ({ ...ing, total: (parseFloat(ing.amount) || 0) * servicesCount })),
            dilution,
            total: batchTotal + dilution
        };
    } else {
        const multiplier = totalRecipeMl > 0 ? targetCapacity / totalRecipeMl : 0;
        results = {
            items: ingredients.map(ing => ({ ...ing, total: (parseFloat(ing.amount) || 0) * multiplier })),
            total: targetCapacity
        };
    }

    return (
        <div className="fade-in space-y-4">
            <UnitConverter />

            <div className="flex gap-2">
                <button className={`flex-1 ${mode === 'services' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setMode('services')}>Servicios</button>
                <button className={`flex-1 ${mode === 'capacity' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setMode('capacity')}>Capacidad</button>
            </div>

            <div className="card">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="font-black uppercase tracking-widest text-[11px] text-gray-500">Recetas Guardadas</h3>
                    <button onClick={() => { setEditingPreset(null); setRecipeName(''); setIngredients([{ name: '', amount: '', unit: 'ml' }]); }} className="text-orange-500 font-black text-[10px] uppercase tracking-widest flex items-center gap-1">
                        <Plus size={14} /> Nueva
                    </button>
                </div>

                <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide">
                    {classics.length === 0 && (
                        <p className="text-[10px] text-gray-600 uppercase font-black tracking-widest py-2">No hay recetas guardadas</p>
                    )}
                    {classics.map(c => (
                        <div key={c.id} className="relative group flex-shrink-0">
                            <button
                                onClick={() => loadClassic(c)}
                                className="h-11 text-[10px] px-6 border border-gray-800 rounded-xl text-gray-400 font-black uppercase bg-white/5 whitespace-nowrap hover:border-orange-500/40 hover:text-white transition-all"
                            >
                                {c.name}
                            </button>
                            <div className="absolute -top-1 -right-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={(e) => { e.stopPropagation(); setEditingPreset(c); saveCurrentAsPreset(); }} className="w-5 h-5 bg-gray-800 border border-white/10 rounded-full flex items-center justify-center text-blue-400"><Edit3 size={10} /></button>
                                <button onClick={(e) => deletePreset(e, c.id)} className="w-5 h-5 bg-gray-800 border border-white/10 rounded-full flex items-center justify-center text-red-500"><X size={10} /></button>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="space-y-4">
                    <div className="input-group">
                        <label className="text-[10px] text-orange-500/50">Nombre de la Receta</label>
                        <input
                            placeholder="Ej: Margarita Spicy"
                            className="bg-black/40 border-gray-800 font-bold text-white h-12"
                            value={recipeName}
                            onChange={e => setRecipeName(e.target.value)}
                        />
                    </div>

                    <div className="space-y-3 w-full">
                        <div className="flex gap-2 w-full items-center">
                            <span className="flex-1 text-[10px] font-black uppercase text-gray-500 tracking-widest pl-4 text-left">Ingrediente</span>
                            <span className="w-16 text-[10px] font-black uppercase text-gray-500 tracking-widest text-center">Cant.</span>
                            <span className="w-16"></span>
                        </div>
                        {ingredients.map((ing, idx) => (
                            <div key={idx} className="flex flex-row w-full gap-2 items-end h-14 animate-in" style={{ alignItems: 'flex-end' }}>
                                <input
                                    type="text"
                                    placeholder="Ingrediente..."
                                    className="flex-1 m-0 h-full border border-gray-800 rounded-2xl text-sm focus:border-orange-500 transition-colors px-4 font-bold"
                                    style={{
                                        minWidth: '120px',
                                        backgroundColor: '#1a1a1a',
                                        color: '#ffffff'
                                    }}
                                    value={ing.name}
                                    onChange={e => updateIngredient(idx, 'name', e.target.value)}
                                />
                                <input
                                    type="number"
                                    placeholder="0"
                                    className="w-16 flex-shrink-0 m-0 h-full text-center p-0 font-black border border-gray-800 rounded-2xl text-base focus:border-orange-500 transition-colors"
                                    style={{
                                        backgroundColor: '#1a1a1a',
                                        color: '#ffffff'
                                    }}
                                    value={ing.amount}
                                    onChange={e => updateIngredient(idx, 'amount', e.target.value)}
                                />
                                <button type="button" className="w-16 h-full m-0 border border-gray-800 text-orange-500 flex-shrink-0 hover:text-black hover:bg-orange-500 hover:border-orange-500 rounded-2xl flex items-center justify-center transition-all shadow-none"
                                    style={{ backgroundColor: '#1a1a1a' }}
                                    onClick={() => removeIngredient(idx)}>
                                    <Trash2 size={20} />
                                </button>
                            </div>
                        ))}
                        <button type="button" className="w-full h-14 mt-2 bg-orange-500/10 border border-orange-500 text-[11px] font-black uppercase tracking-widest text-orange-500 hover:bg-orange-500 hover:text-black transition-all flex items-center justify-center gap-2 rounded-2xl shadow-none" onClick={addIngredient}>
                            <Plus size={18} /> Añadir Líquido
                        </button>
                    </div>
                </div>

                <button onClick={saveCurrentAsPreset} className="w-full h-12 bg-orange-500 text-black mt-4 rounded-xl font-black uppercase tracking-widest text-[10px] active:scale-95 transition-all">
                    Guardar Receta
                </button>
            </div>

            <div className="card">
                <label>{mode === 'services' ? 'Nº Servicios' : 'Capacidad Botella (ml)'}</label>
                <input
                    type="number"
                    className="text-center font-black"
                    value={mode === 'services' ? servicesCount : targetCapacity}
                    onChange={e => mode === 'services' ? setServicesCount(e.target.value) : setTargetCapacity(e.target.value)}
                />
            </div>

            {(results && (totalRecipeMl > 0 || ingredients.length > 0)) && (
                <div className="card border-orange-500/50 shadow-orange bg-black">
                    <h3 className="text-center text-orange-500 mb-6 font-black tracking-widest uppercase text-xs">CÁLCULO DE BATCH</h3>
                    <div className="space-y-2">
                        {results.items.map((ing, idx) => (
                            <div key={idx} className="flex justify-between items-center bg-white/5 p-4 rounded-2xl border border-white/5">
                                <span className="text-xs font-bold uppercase text-gray-400">{ing.name || 'Ingrediente'}</span>
                                <span className="font-black text-lg text-white">{ing.total.toFixed(0)} <small className="text-[10px] text-orange-500">ml</small></span>
                            </div>
                        ))}
                        {mode === 'services' && (
                            <div className="flex justify-between items-center bg-blue-500/5 border border-blue-500/20 p-4 rounded-2xl text-blue-400 mt-2">
                                <span className="text-[10px] font-black uppercase flex items-center gap-2"><Droplet size={14} /> Dilución (+15%)</span>
                                <span className="font-black text-lg text-blue-300">{results.dilution.toFixed(0)} ml</span>
                            </div>
                        )}
                        <div className="mt-8 pt-6 border-t border-dashed border-gray-800 flex justify-between items-end">
                            <div className="flex flex-col">
                                <span className="font-black text-[9px] uppercase text-gray-500 tracking-widest-lg mb-1">Total Mezcla</span>
                                <span className="text-2xl font-black text-gray-400 tracking-tighter mb-2">{batchTotal.toFixed(0)} <small className="text-xs">ml</small></span>
                                <span className="font-black text-[9px] uppercase text-orange-500 tracking-widest-lg mb-1">Total con Dilución (+15%)</span>
                                <span className="text-4xl font-black text-white tracking-tighter">{results.total.toFixed(0)} <small className="text-sm">ml</small></span>
                            </div>
                            <div className="w-12 h-12 bg-white text-black rounded-full flex items-center justify-center font-black">
                                <Calculator size={24} />
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const CostCalculator = () => {
    const [cocktailName, setCocktailName] = useState('');
    const [scandallIngredients, setScandallIngredients] = useState([{ name: '', price: '', vol: '', use: '' }]);
    const [scandalls, setScandalls] = useState(() => {
        const saved = localStorage.getItem('sirius_scandalls');
        return saved ? JSON.parse(saved) : [];
    });

    useEffect(() => {
        localStorage.setItem('sirius_scandalls', JSON.stringify(scandalls));
    }, [scandalls]);

    const addIngredient = () => setScandallIngredients([...scandallIngredients, { name: '', price: '', vol: '', use: '' }]);
    const updateIngredient = (index, field, value) => {
        const next = [...scandallIngredients];
        next[index][field] = value;
        setScandallIngredients(next);
    };
    const removeIngredient = (index) => setScandallIngredients(scandallIngredients.filter((_, i) => i !== index));

    const totalCost = scandallIngredients.reduce((acc, curr) => {
        const cost = (parseFloat(curr.price) / (parseFloat(curr.vol) || 1)) * (parseFloat(curr.use) || 0);
        return acc + (!isNaN(cost) ? cost : 0);
    }, 0);

    const suggestedPrice = totalCost * 4;

    const saveScandall = () => {
        if (!cocktailName) {
            alert('Por favor, ponle un nombre al cóctel antes de guardarlo.');
            return;
        }
        const newScandall = {
            id: Date.now(),
            name: cocktailName,
            ingredients: scandallIngredients,
            totalCost
        };
        setScandalls([...scandalls, newScandall]);
        setCocktailName('');
        setScandallIngredients([{ name: '', price: '', vol: '', use: '' }]);
    };

    const deleteScandall = (id) => {
        if (window.confirm('¿Eliminar escandallo?')) {
            setScandalls(scandalls.filter(s => s.id !== id));
        }
    }

    return (
        <div className="fade-in space-y-6 pb-32">
            <div className="card border-orange-500/30">
                <div className="input-group mb-6">
                    <label className="text-[10px] uppercase font-black tracking-widest text-orange-500">Nombre del Cóctel</label>
                    <input type="text" value={cocktailName} onChange={e => setCocktailName(e.target.value)} placeholder="Ej: Negroni Clásico" className="h-14 font-bold text-white bg-black/40 border-gray-800" />
                </div>

                <div className="space-y-4">
                    <label className="text-[10px] uppercase font-black tracking-widest text-gray-500">Ingredientes y Costes</label>
                    {scandallIngredients.map((ing, idx) => {
                        const ingCost = (parseFloat(ing.price) / (parseFloat(ing.vol) || 1)) * (parseFloat(ing.use) || 0);
                        return (
                            <div key={idx} className="bg-black/40 p-4 rounded-3xl border border-gray-800 space-y-3 relative animate-in">
                                <button type="button" onClick={() => removeIngredient(idx)} className="absolute top-4 right-4 text-gray-600 hover:text-red-500 transition-colors">
                                    <Trash2 size={16} />
                                </button>

                                <div className="input-group">
                                    <label className="text-[9px]">Ingrediente</label>
                                    <input type="text" value={ing.name} onChange={e => updateIngredient(idx, 'name', e.target.value)} placeholder="Campari..." className="h-10 text-xs" />
                                </div>
                                <div className="grid grid-cols-3 gap-2">
                                    <div className="input-group">
                                        <label className="text-[9px]">Precio(€)</label>
                                        <input type="number" step="0.01" value={ing.price} onChange={e => updateIngredient(idx, 'price', e.target.value)} placeholder="0.00" className="h-10 text-xs" />
                                    </div>
                                    <div className="input-group">
                                        <label className="text-[9px]">Cap.(ml)</label>
                                        <input type="number" value={ing.vol} onChange={e => updateIngredient(idx, 'vol', e.target.value)} placeholder="700" className="h-10 text-xs" />
                                    </div>
                                    <div className="input-group">
                                        <label className="text-[9px]">Uso(ml)</label>
                                        <input type="number" value={ing.use} onChange={e => updateIngredient(idx, 'use', e.target.value)} placeholder="30" className="h-10 text-xs text-orange-500 font-bold border-orange-500/30" />
                                    </div>
                                </div>
                                {ingCost > 0 && <div className="text-right text-[10px] font-black text-gray-400">COSTE: <span className="text-white">{ingCost.toFixed(2)}€</span></div>}
                            </div>
                        )
                    })}
                </div>

                <button type="button" onClick={addIngredient} className="w-full h-14 bg-orange-500/10 border border-orange-500/20 text-orange-500 rounded-2xl font-black uppercase tracking-widest text-[10px] mt-4 hover:bg-orange-500 hover:text-black transition-all flex justify-center items-center gap-2">
                    <Plus size={16} /> Añadir Ingrediente
                </button>
            </div>

            {totalCost > 0 && (
                <div className="card shadow-orange border-orange-500/50 bg-[#121212]">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white/5 p-4 rounded-2xl flex flex-col justify-center items-center">
                            <span className="text-[9px] font-black uppercase text-gray-500 tracking-widest-lg mb-1 text-center">Coste Total<br />Cóctel</span>
                            <span className="text-3xl font-black text-white">{totalCost.toFixed(2)}€</span>
                        </div>
                        <div className="bg-orange-500/10 p-4 border border-orange-500/20 rounded-2xl flex flex-col justify-center items-center">
                            <span className="text-[9px] font-black uppercase text-orange-500/60 tracking-widest-lg mb-1 text-center">PVP Sugerido<br />(Aprox x4)</span>
                            <span className="text-2xl font-black text-orange-500">{suggestedPrice.toFixed(2)}€</span>
                        </div>
                    </div>
                </div>
            )}

            <button type="button" onClick={saveScandall} className="w-full h-14 bg-orange-500 text-black rounded-2xl font-black uppercase text-[11px] shadow-lg shadow-orange-500/20 active:scale-95 transition-all flex items-center justify-center gap-2">
                <Save size={18} /> Guardar Escandallo
            </button>

            {scandalls.length > 0 && (
                <div className="space-y-4 pt-8 border-t border-dashed border-gray-800">
                    <h3 className="font-black tracking-widest text-[10px] text-gray-500 uppercase">Escandallos Guardados</h3>
                    {scandalls.map(s => (
                        <div key={s.id} className="card border-l-4 border-l-orange-500 p-6 flex justify-between items-center">
                            <div>
                                <h4 className="text-lg font-black text-white">{s.name}</h4>
                                <p className="text-[10px] text-gray-500 uppercase font-bold mt-1">Coste: {s.totalCost.toFixed(2)}€ / Sugerido: {(s.totalCost * 4).toFixed(2)}€</p>
                            </div>
                            <button onClick={() => deleteScandall(s.id)} className="w-10 h-10 bg-red-500/5 text-red-500 rounded-xl flex items-center justify-center hover:bg-red-500/10 transition-colors">
                                <Trash2 size={16} />
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

const InventoryView = () => {
    const [items, setItems] = useState(() => {
        const saved = localStorage.getItem('sirius_stock');
        return saved ? JSON.parse(saved) : [
            { id: 1, name: 'Tanqueray Gin', category: 'Alcohol', servingsPerBottle: 14, currentServings: 14, openedAt: new Date().toISOString(), price: 18.50 },
            { id: 2, name: 'Campari', category: 'Alcohol', servingsPerBottle: 23, currentServings: 15, openedAt: new Date().toISOString(), price: 14.20 },
            { id: 3, name: 'Sirope de Azúcar', category: 'No Alcohol', servingsPerBottle: 35, currentServings: 35, openedAt: new Date().toISOString(), price: 6.00 }
        ];
    });

    const [searchTerm, setSearchTerm] = useState('');
    const [activeFilter, setActiveFilter] = useState('All');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [showInfoId, setShowInfoId] = useState(null);

    useEffect(() => {
        localStorage.setItem('sirius_stock', JSON.stringify(items));
    }, [items]);

    const totalValue = items.reduce((acc, item) => {
        const fullBottles = Math.ceil(item.currentServings / item.servingsPerBottle);
        return acc + (fullBottles * item.price);
    }, 0);

    const openEditModal = (item) => {
        setEditingItem(item);
        setIsModalOpen(true);
    };

    const handleFormSubmit = (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const name = formData.get('name');
        const price = parseFloat(formData.get('price')) || 0;
        const servingsPerBottle = parseInt(formData.get('servingsPerBottle')) || 14;
        const category = formData.get('category');
        const currentServings = parseInt(formData.get('currentServings')) ?? servingsPerBottle;

        if (editingItem) {
            setItems(items.map(i => i.id === editingItem.id ? {
                ...i,
                name,
                price,
                servingsPerBottle,
                category,
                currentServings
            } : i));
        } else {
            const newItem = {
                id: Date.now(),
                name,
                price,
                servingsPerBottle,
                category,
                currentServings,
                openedAt: new Date().toISOString()
            };
            setItems([...items, newItem]);
        }
        setIsModalOpen(false);
        setEditingItem(null);
    };

    const editTragosDirectly = (item) => {
        const newValue = prompt(`Editar tragos para ${item.name}:`, item.currentServings);
        const parsedValue = parseInt(newValue);
        if (newValue !== null && !isNaN(parsedValue) && newValue.trim() !== '') {
            setItems(items.map(i => i.id === item.id ? { ...i, currentServings: parsedValue } : i));
        }
    };

    const deleteItem = (id) => {
        if (window.confirm('¿Eliminar producto?')) {
            setItems(items.filter(i => i.id !== id));
        }
    };

    const updateTragos = (id, delta) => {
        setItems(items.map(item => {
            if (item.id === id) {
                return { ...item, currentServings: Math.max(0, item.currentServings + delta) };
            }
            return item;
        }));
    };

    const getTimeInInventory = (dateStr) => {
        const opened = new Date(dateStr);
        const now = new Date();
        const diffDays = Math.floor((now - opened) / (1000 * 60 * 60 * 24));
        if (diffDays === 0) return 'Hoy';
        return `Hace ${diffDays} día${diffDays > 1 ? 's' : ''}`;
    };

    const filteredItems = items.filter(i => {
        const matchesSearch = i.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter = activeFilter === 'All' || i.category === activeFilter;
        return matchesSearch && matchesFilter;
    });

    return (
        <div className="fade-in space-y-4 pb-32">
            <div className="card bg-orange-500 border-none flex justify-between items-center py-8 px-8 rounded-3xl shadow-2xl">
                <div>
                    <span className="text-[10px] font-black uppercase text-black/60 tracking-widest-lg">Inventario Global</span>
                    <h2 className="text-4xl font-black text-black tracking-tighter">{totalValue.toFixed(2)}€</h2>
                </div>
                <TrendingUp className="text-black/30" size={40} />
            </div>

            <div className="sticky-search bg-black/80 backdrop-blur-xl pb-6">
                <div className="relative mb-3">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-600" size={18} />
                    <input
                        type="text"
                        placeholder="Buscar producto..."
                        className="pl-14 bg-white/5 border-gray-800 h-14 rounded-2xl"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex gap-2 overflow-x-auto scrollbar-hide px-1">
                    {['All', 'Alcohol', 'No Alcohol'].map(cat => (
                        <button
                            key={cat}
                            onClick={() => setActiveFilter(cat)}
                            className={`filter-pill h-10 ${activeFilter === cat ? 'active' : ''}`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </div>

            <div className="space-y-4">
                <button
                    type="button"
                    onClick={() => {
                        if (isModalOpen && !editingItem) {
                            setIsModalOpen(false);
                        } else {
                            setEditingItem(null);
                            setIsModalOpen(true);
                        }
                    }}
                    className={`w-full h-12 rounded-2xl font-black uppercase text-[11px] mb-2 shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2 ${isModalOpen && !editingItem ? 'bg-red-500/10 text-red-500 border border-red-500/20' : 'bg-orange-500 text-black shadow-orange-500/20'}`}
                >
                    {isModalOpen && !editingItem ? <><X size={18} /> Cancelar</> : <><Plus size={18} /> Nuevo Producto</>}
                </button>

                {isModalOpen && (
                    <div className="card bg-white/5 border border-white/10 mb-6 animate-in rounded-3xl p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-black tracking-tighter uppercase text-white">{editingItem ? 'Editar Producto' : 'Nuevo Producto'}</h2>
                            <button onClick={() => { setIsModalOpen(false); setEditingItem(null); }} className="w-8 h-8 bg-white/5 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors"><X size={16} /></button>
                        </div>

                        <form onSubmit={handleFormSubmit} className="space-y-4">
                            <div className="input-group mb-4">
                                <label className="text-[10px] uppercase font-black tracking-widest text-gray-400">Nombre Producto</label>
                                <input name="name" defaultValue={editingItem?.name} required placeholder="Ej: Tanqueray" className="h-12 text-sm bg-black/40 border-gray-800 focus:border-orange-500" />
                            </div>

                            <div className="grid grid-cols-2 gap-3 mb-4">
                                <div className="input-group">
                                    <label className="text-[10px] uppercase font-black tracking-widest text-gray-400">Categoría</label>
                                    <select name="category" defaultValue={editingItem?.category || 'Alcohol'} className="h-12 text-sm bg-black/40 border-gray-800 focus:border-orange-500">
                                        <option value="Alcohol">Alcohol 🍸</option>
                                        <option value="No Alcohol">No Alc 🍋</option>
                                    </select>
                                </div>
                                <div className="input-group">
                                    <label className="text-[10px] uppercase font-black tracking-widest text-gray-400">Precio (€)</label>
                                    <input name="price" type="number" step="0.01" defaultValue={editingItem?.price} required className="h-12 text-sm bg-black/40 border-gray-800 focus:border-orange-500" placeholder="0.00" />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3 mb-6">
                                <div className="input-group">
                                    <label className="text-[10px] uppercase font-black tracking-widest text-gray-400">Tragos/Botella</label>
                                    <input name="servingsPerBottle" type="number" defaultValue={editingItem?.servingsPerBottle || 14} required className="h-12 text-sm bg-black/40 border-gray-800 focus:border-orange-500" />
                                </div>
                                <div className="input-group">
                                    <label className="text-[10px] uppercase font-black tracking-widest text-gray-400">Capacidad Botella (ml)</label>
                                    <input name="currentServings" type="number" defaultValue={editingItem?.currentServings || 700} required className="h-12 text-sm bg-black/40 border-gray-800 focus:border-orange-500" placeholder="Ej: 700, 1000" />
                                </div>
                            </div>

                            <button type="submit" className="w-full h-12 bg-orange-500 text-black rounded-xl uppercase font-black text-[11px] shadow-lg shadow-orange-500/20 active:scale-95 transition-all flex items-center justify-center gap-2">
                                <Save size={16} /> Guardar Producto
                            </button>
                        </form>
                    </div>
                )}

                {filteredItems.map(item => (
                    <div key={item.id} className="card border-l-4 p-6" style={{ borderColor: item.category === 'Alcohol' ? 'var(--accent-orange)' : '#4ade80' }}>
                        <div className="flex justify-between items-start mb-6">
                            <div onClick={() => openEditModal(item)} className="cursor-pointer">
                                <span className={`text-[8px] font-black px-2 py-1 rounded-full uppercase tracking-widest ${item.category === 'Alcohol' ? 'bg-orange-500/10 text-orange-500' : 'bg-green-500/10 text-green-400'}`}>
                                    {item.category}
                                </span>
                                <h3 className="text-xl font-black text-white mt-1">{item.name}</h3>
                            </div>
                            <div className="flex gap-2">
                                <button onClick={() => deleteItem(item.id)} className="w-11 h-11 bg-red-500/5 hover:bg-red-500/10 rounded-xl flex items-center justify-center text-red-500 transition-all"><Trash2 size={18} /></button>
                            </div>
                        </div>

                        <div className="flex items-center gap-4 bg-black/40 p-4 rounded-2xl border border-white/5">
                            <button onClick={() => updateTragos(item.id, -1)} className="w-14 h-14 bg-gray-900 rounded-xl flex items-center justify-center active:scale-90 transition-all">
                                <Minus size={24} className="text-gray-600" />
                            </button>

                            <button
                                onClick={() => editTragosDirectly(item)}
                                className="btn-action flex-1 bg-white/5 border border-white/5 rounded-2xl flex flex-col items-center justify-center hover:bg-orange-500/5 group"
                            >
                                <span className="text-2xl font-black text-white group-hover:text-orange-500 transition-colors">{item.currentServings}</span>
                                <span className="text-[7px] text-orange-500 font-black uppercase tracking-widest opacity-40 group-hover:opacity-100">Editar</span>
                            </button>

                            <button onClick={() => updateTragos(item.id, 1)} className="w-14 h-14 bg-orange-500 text-black rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/20 active:scale-90 transition-all">
                                <Plus size={24} />
                            </button>
                        </div>

                        <div className="mt-4 flex justify-between items-center">
                            <button
                                onClick={() => setShowInfoId(showInfoId === item.id ? null : item.id)}
                                className="btn-action bg-white/5 text-gray-500 hover:text-white rounded-xl"
                            >
                                {showInfoId === item.id ? 'Cerrar' : 'Opciones'}
                            </button>
                            {item.currentServings < 5 && (
                                <span className="flex items-center gap-1.5 text-[8px] font-black text-red-500 uppercase tracking-widest bg-red-500/10 px-3 py-1.5 rounded-full animate-pulse">
                                    <AlertCircle size={10} /> Stock Bajo
                                </span>
                            )}
                        </div>

                        {showInfoId === item.id && (
                            <div className="mt-6 pt-6 border-t border-white/5 grid grid-cols-2 gap-3 fade-in">
                                <div className="bg-white/5 p-4 rounded-2xl">
                                    <p className="text-[8px] text-muted font-black uppercase tracking-widest mb-1">Apertura</p>
                                    <p className="text-xs font-black flex items-center gap-2 text-white"><Calendar size={12} className="text-orange-500" /> {getTimeInInventory(item.openedAt)}</p>
                                </div>
                                <div className="bg-white/5 p-4 rounded-2xl">
                                    <p className="text-[8px] text-muted font-black uppercase tracking-widest mb-1">Costo Botella</p>
                                    <p className="text-xs font-black flex items-center gap-2 text-white"><Euro size={12} className="text-orange-500" /> {item.price.toFixed(2)}€</p>
                                </div>
                                <button className="col-span-2 mt-2 h-10 flex items-center justify-center gap-2 text-[10px] uppercase font-black text-orange-500 bg-orange-500/10 rounded-xl" onClick={() => openEditModal(item)}>
                                    <Edit3 size={14} /> Editar Información Global
                                </button>
                            </div>
                        )}
                    </div>
                ))}
            </div>

        </div>
    );
};

export default function App() {
    const [activeTab, setActiveTab] = useState('batching');
    const [showRegisterBanner, setShowRegisterBanner] = useState(true);

    const handleCoffee = () => {
        window.open('https://www.buymeacoffee.com/siriusbartender', '_blank');
    };

    return (
        <div className="container overflow-x-hidden">
            {showRegisterBanner && (
                <div className="bg-orange-500 text-black px-4 py-3 flex items-center justify-between sticky top-0 z-[1000] animate-in shadow-xl">
                    <div className="flex items-center gap-2">
                        <UserPlus size={16} />
                        <span className="text-[9px] font-black uppercase tracking-widest">Registrate para guardar datos en la nube</span>
                    </div>
                    <button onClick={() => setShowRegisterBanner(false)} className="text-black/60 hover:text-black"><X size={16} /></button>
                </div>
            )}

            <header className="flex justify-between items-center py-8 px-4">
                <div className="flex items-center gap-3">
                    <div className="w-2.5 h-10 bg-orange-500 rounded-full"></div>
                    <div>
                        <h1 className="text-3xl font-black tracking-tighter text-white leading-none">SIRIUS</h1>
                    </div>
                </div>
                <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center border border-white/5 text-gray-600">
                    <Lock size={20} />
                </div>
            </header>

            <main className="flex-1 px-4 mt-2">
                {activeTab === 'batching' && <BatchingCalculator />}
                {activeTab === 'costs' && <CostCalculator />}
                {activeTab === 'inventory' && <InventoryView />}
                {activeTab === 'info' && (
                    <div className="fade-in space-y-6 pb-20">
                        <div className="text-center py-12">
                            <h2 className="text-8xl font-black tracking-tighter text-white">SIRIUS</h2>
                            <p className="text-orange-500 font-black tracking-widest-xl uppercase text-[12px] mt-2">Intelligence at the Bar</p>
                        </div>
                        <div className="card bg-orange-500/5 backdrop-blur-sm p-10 rounded-3xl border border-orange-500/10 flex flex-col items-center text-center">
                            <Info size={40} className="text-orange-500 mb-6" />
                            <h3 className="font-black uppercase text-white mb-4 tracking-widest text-sm text-center">Dilución del 15%</h3>
                            <p className="text-gray-400 text-xs leading-relaxed mb-4 text-center">
                                Al batchear, el hielo no aporta agua de forma natural. Añadimos un 15% de agua extra al total de la mezcla para simular la dilución que ocurriría al agitar o refrescar el cóctel individualmente.
                            </p>
                        </div>

                        <div className="card text-center p-8">
                            <p className="text-muted text-[10px] italic">Made with Precision for High-Volume Bars</p>
                        </div>
                    </div>
                )}
            </main>

            <nav className="bottom-nav">
                <button className={`nav-item ${activeTab === 'batching' ? 'active' : ''}`} onClick={() => setActiveTab('batching')}>
                    <Calculator size={22} /><span className="font-black uppercase tracking-widest text-[8px] mt-1">Calculadora</span>
                </button>
                <button className={`nav-item ${activeTab === 'costs' ? 'active' : ''}`} onClick={() => setActiveTab('costs')}>
                    <Euro size={22} /><span className="font-black uppercase tracking-widest text-[8px] mt-1">Costes</span>
                </button>
                <button className={`nav-item ${activeTab === 'inventory' ? 'active' : ''}`} onClick={() => setActiveTab('inventory')}>
                    <Package size={22} /><span className="font-black uppercase tracking-widest text-[8px] mt-1">Mesa</span>
                </button>
                <button className={`nav-item ${activeTab === 'info' ? 'active' : ''}`} onClick={() => setActiveTab('info')}>
                    <Info size={22} /><span className="font-black uppercase tracking-widest text-[8px] mt-1">SIRIUS</span>
                </button>
            </nav>
        </div>
    );
}
