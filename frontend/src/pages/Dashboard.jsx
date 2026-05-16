import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { CheckCircle, Clock, AlertCircle, Plus, LogOut, Trash2, ArrowUpCircle, ArrowRightCircle, ArrowDownCircle, Search, LayoutGrid, List, Hexagon, Download, Printer, Bell, Settings, Command, X, Copy, Maximize2, Tag, Calendar, BarChart2, Zap, Archive, FilterX, User as UserIcon } from 'lucide-react';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({ totalTasks: 0, completedTasks: 0, inProgressTasks: 0, toDoTasks: 0 });
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [newProject, setNewProject] = useState({ name: '', description: '' });
  const [newTask, setNewTask] = useState({ title: '', description: '', projectId: '', assigneeId: '', dueDate: '', priority: 'Medium', tags: '', storyPoints: 0, estimatedHours: 0 });
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('kanban');
  const [sortBy, setSortBy] = useState('default');
  const [myTasksOnly, setMyTasksOnly] = useState(false);
  const [focusMode, setFocusMode] = useState(false);
  const [collapsedCols, setCollapsedCols] = useState({});
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const fetchData = async () => {
    try {
      const [projRes, taskRes, statsRes] = await Promise.all([
        axios.get('/api/projects'),
        axios.get('/api/tasks'),
        axios.get('/api/dashboard/stats')
      ]);
      setProjects(projRes.data);
      setTasks(taskRes.data);
      setStats(statsRes.data);
      if (user.role === 'Admin') {
        const userRes = await axios.get('/api/users');
        setUsers(userRes.data);
      }
    } catch (error) {
      toast.error('Failed to load dashboard data', { style: { background: '#1e293b', color: '#fff' }});
      if (error.response?.status === 401) {
        logout();
      }
    } finally {
      setTimeout(() => setLoading(false), 600);
    }
  };

  useEffect(() => {
    fetchData();
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        document.getElementById('searchInput')?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [user]);

  const handleCreateProject = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/projects', newProject);
      toast.success('Project created successfully!', { style: { background: '#1e293b', color: '#fff' }});
      setShowProjectModal(false);
      setNewProject({ name: '', description: '' });
      fetchData();
    } catch (error) {
      toast.error('Error creating project');
    }
  };

  const handleDeleteProject = async (id) => {
    if (!window.confirm('Delete this project?')) return;
    try {
      await axios.delete(`/api/projects/${id}`);
      toast.success('Project deleted');
      fetchData();
    } catch (error) {
      toast.error('Error deleting project');
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`/api/projects/${newTask.projectId}/tasks`, newTask);
      toast.success('Task assigned!');
      setShowTaskModal(false);
      setNewTask({ title: '', description: '', projectId: '', assigneeId: '', dueDate: '', priority: 'Medium', tags: '', storyPoints: 0, estimatedHours: 0 });
      fetchData();
    } catch (error) {
      toast.error('Error creating task');
    }
  };

  const handleDeleteTask = async (id) => {
    if (!window.confirm('Delete task?')) return;
    try {
      await axios.delete(`/api/tasks/${id}`);
      toast.success('Task deleted');
      fetchData();
    } catch (error) {
      toast.error('Error deleting task');
    }
  };

  const updateTaskStatus = async (id, status) => {
    try {
      await axios.patch(`/api/tasks/${id}`, { status });
      toast.success('Status updated');
      fetchData();
    } catch (error) {
      toast.error('Error updating status');
    }
  };

  const handleDragStart = (e, taskId) => e.dataTransfer.setData('taskId', taskId);
  const handleDrop = async (e, newStatus) => {
    const taskId = e.dataTransfer.getData('taskId');
    const task = tasks.find(t => t.id === parseInt(taskId));
    if (task && task.status !== newStatus) {
      setTasks(tasks.map(t => t.id === parseInt(taskId) ? { ...t, status: newStatus } : t));
      await updateTaskStatus(taskId, newStatus);
    }
  };
  const handleDragOver = (e) => e.preventDefault();

  const exportToCSV = () => {
    const headers = ['ID', 'Title', 'Status', 'Priority', 'Project', 'Assignee', 'Due Date'];
    const rows = tasks.map(t => [t.id, t.title, t.status, t.priority, t.Project?.name, t.assignee?.name, t.dueDate]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "nexus_tasks_export.csv");
    document.body.appendChild(link);
    link.click();
    toast.success('Exported to CSV');
  };

  const copyTaskLink = (id) => {
    navigator.clipboard.writeText(`Task ID: #${id}`);
    toast.success('Task ID copied to clipboard!');
  };

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'High': return <span className="flex items-center text-[10px] font-bold text-rose-400 bg-rose-400/10 border border-rose-400/20 px-2 py-0.5 rounded-full"><ArrowUpCircle className="w-3 h-3 mr-1" /> HIGH</span>;
      case 'Medium': return <span className="flex items-center text-[10px] font-bold text-amber-400 bg-amber-400/10 border border-amber-400/20 px-2 py-0.5 rounded-full"><ArrowRightCircle className="w-3 h-3 mr-1" /> MED</span>;
      default: return <span className="flex items-center text-[10px] font-bold text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 px-2 py-0.5 rounded-full"><ArrowDownCircle className="w-3 h-3 mr-1" /> LOW</span>;
    }
  };

  const isOverdue = (date) => date && new Date(date) < new Date();

  let filteredTasks = tasks.filter(t => 
    t.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (t.description && t.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (t.tags && t.tags.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  if (myTasksOnly) filteredTasks = filteredTasks.filter(t => t.assigneeId === user.id);

  if (sortBy === 'priority') {
    const pWeight = { 'High': 3, 'Medium': 2, 'Low': 1 };
    filteredTasks.sort((a, b) => pWeight[b.priority] - pWeight[a.priority]);
  } else if (sortBy === 'dueDate') {
    filteredTasks.sort((a, b) => new Date(a.dueDate || '2099') - new Date(b.dueDate || '2099'));
  }

  const getProjectProgress = (projId) => {
    const projTasks = tasks.filter(t => t.projectId === projId);
    if (!projTasks.length) return 0;
    const done = projTasks.filter(t => t.status === 'Done').length;
    return Math.round((done / projTasks.length) * 100);
  };

  if (loading) return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center">
      <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className={`min-h-screen flex flex-col font-sans relative bg-slate-950 text-slate-200 ${focusMode ? 'px-0' : ''}`}>
      <div className="fixed inset-0 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03]"></div>
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-fuchsia-600/10 rounded-full blur-[100px] pointer-events-none"></div>

      {/* Navbar */}
      {!focusMode && (
        <nav className="glass-panel border-x-0 border-t-0 sticky top-0 z-40 print:hidden">
          <div className="max-w-[1400px] mx-auto px-6 py-4 flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-fuchsia-500 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20 cursor-pointer" onClick={() => window.location.reload()}>
                <Hexagon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white tracking-tight">NexusTasks</h1>
                <p className="text-[10px] text-indigo-400 font-bold tracking-widest uppercase">{user.role} Workspace</p>
              </div>
            </div>
            
            <div className="flex-1 max-w-xl w-full relative group flex items-center">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-slate-400 group-focus-within:text-indigo-400 transition-colors" />
              </div>
              <input
                id="searchInput"
                type="text"
                placeholder="Search tasks, tags, descriptions... (Cmd+K)"
                className="w-full pl-11 pr-4 py-2.5 bg-slate-900/50 border border-slate-700/50 rounded-2xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all text-sm shadow-inner"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                <Command className="h-3 w-3 text-slate-500" /> <span className="text-slate-500 text-xs ml-1 font-mono">K</span>
              </div>
            </div>

            <div className="flex items-center space-x-2 pl-4 border-l border-slate-700/50 relative">
              <button onClick={() => setFocusMode(true)} className="p-2 text-slate-400 hover:text-white transition" title="Focus Mode"><Maximize2 className="w-5 h-5" /></button>
              <div className="relative">
                <button onClick={() => {setShowNotifications(!showNotifications); setShowProfileMenu(false);}} className="p-2 text-slate-400 hover:text-white transition relative" title="Notifications">
                  <Bell className="w-5 h-5" />
                  <span className="absolute top-1 right-1 w-2 h-2 bg-rose-500 rounded-full animate-pulse"></span>
                </button>
                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-80 glass-panel rounded-xl shadow-2xl z-50 overflow-hidden">
                    <div className="px-4 py-3 border-b border-slate-700/50 flex justify-between items-center bg-slate-900/50">
                      <h3 className="font-bold text-white text-sm">Notifications</h3>
                      <button className="text-xs text-indigo-400 hover:text-indigo-300">Mark all read</button>
                    </div>
                    <div className="max-h-64 overflow-y-auto divide-y divide-slate-800">
                      <div className="p-4 hover:bg-slate-800/50 transition cursor-pointer">
                        <p className="text-xs text-slate-400 mb-1">Just now</p>
                        <p className="text-sm text-slate-200">Welcome to the <span className="font-bold text-indigo-400">NexusTasks</span> dashboard! Create a project to get started.</p>
                      </div>
                      <div className="p-4 hover:bg-slate-800/50 transition cursor-pointer">
                        <p className="text-xs text-slate-400 mb-1">2 hours ago</p>
                        <p className="text-sm text-slate-200">System update completed successfully. 25 new features were added to your workspace.</p>
                      </div>
                      {tasks.filter(t => isOverdue(t.dueDate) && t.status !== 'Done').length > 0 && (
                        <div className="p-4 hover:bg-slate-800/50 transition cursor-pointer bg-rose-500/5">
                          <p className="text-xs text-rose-400 mb-1">Alert</p>
                          <p className="text-sm text-slate-200">You have {tasks.filter(t => isOverdue(t.dueDate) && t.status !== 'Done').length} overdue tasks that need attention.</p>
                        </div>
                      )}
                    </div>
                    <div className="p-2 bg-slate-900/80 text-center border-t border-slate-700/50">
                      <button className="text-xs text-slate-400 hover:text-white transition">View all activity</button>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="relative ml-2">
                <button onClick={() => {setShowProfileMenu(!showProfileMenu); setShowNotifications(false);}} className="flex items-center space-x-2 p-1 hover:bg-slate-800 rounded-full transition pr-3">
                  <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=6366f1&color=fff&size=36`} alt="User" className="rounded-full ring-2 ring-slate-700 shadow-sm" />
                  <span className="text-sm font-bold text-white hidden sm:block">{user.name}</span>
                </button>
                {showProfileMenu && (
                  <div className="absolute right-0 mt-2 w-48 glass-panel rounded-xl py-2 shadow-2xl z-50">
                    <div className="px-4 py-2 border-b border-slate-700/50 mb-2">
                      <p className="text-xs text-slate-400">Signed in as</p>
                      <p className="text-sm font-bold text-white truncate">{user.email}</p>
                    </div>
                    <button className="w-full text-left px-4 py-2 text-sm text-slate-300 hover:bg-slate-800 hover:text-white flex items-center"><UserIcon className="w-4 h-4 mr-2"/> Profile</button>
                    <button className="w-full text-left px-4 py-2 text-sm text-slate-300 hover:bg-slate-800 hover:text-white flex items-center"><Settings className="w-4 h-4 mr-2"/> Settings</button>
                    <button onClick={logout} className="w-full text-left px-4 py-2 text-sm text-rose-400 hover:bg-slate-800 flex items-center mt-2 border-t border-slate-700/50 pt-3"><LogOut className="w-4 h-4 mr-2"/> Sign out</button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </nav>
      )}

      {/* Focus Mode Exit */}
      {focusMode && (
        <button onClick={() => setFocusMode(false)} className="fixed top-4 right-4 z-50 bg-slate-800 text-white p-3 rounded-full shadow-2xl hover:bg-slate-700 transition">
          <X className="w-6 h-6" />
        </button>
      )}

      <main className="flex-1 max-w-[1400px] w-full mx-auto px-4 sm:px-6 py-8 space-y-8 relative z-10">
        
        {/* Welcome Banner & Stats */}
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="lg:w-1/3 glass-card p-6 rounded-3xl relative overflow-hidden bg-gradient-to-br from-indigo-900/40 to-fuchsia-900/20">
            <div className="relative z-10">
              <h2 className="text-2xl font-black text-white mb-2">Hello, {user.name.split(' ')[0]} 👋</h2>
              <p className="text-slate-400 text-sm mb-6">You have {filteredTasks.filter(t => t.status !== 'Done' && t.assigneeId === user.id).length} pending tasks assigned to you. Let's get to work!</p>
              <button onClick={() => setMyTasksOnly(!myTasksOnly)} className={`px-4 py-2 rounded-xl text-sm font-bold transition ${myTasksOnly ? 'bg-indigo-500 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}>
                {myTasksOnly ? 'View All Tasks' : 'Show My Tasks Only'}
              </button>
            </div>
            <Hexagon className="absolute -right-10 -bottom-10 w-48 h-48 text-indigo-500/10 transform rotate-12" />
          </div>
          
          <div className="lg:w-2/3 grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            <div className="glass-card p-6 rounded-3xl flex flex-col justify-between">
              <p className="text-slate-400 text-sm font-medium">Total Tasks</p>
              <p className="text-4xl font-black text-white mt-4">{stats.totalTasks}</p>
            </div>
            <div className="glass-card p-6 rounded-3xl border-emerald-500/20">
              <p className="text-emerald-400 text-sm font-medium flex items-center"><CheckCircle className="w-4 h-4 mr-1.5"/> Completed</p>
              <p className="text-4xl font-black text-white mt-4">{stats.completedTasks}</p>
            </div>
            <div className="glass-card p-6 rounded-3xl border-amber-500/20">
              <p className="text-amber-400 text-sm font-medium flex items-center"><Clock className="w-4 h-4 mr-1.5"/> In Progress</p>
              <p className="text-4xl font-black text-white mt-4">{stats.inProgressTasks}</p>
            </div>
            <div className="glass-card p-6 rounded-3xl border-indigo-500/20">
              <p className="text-indigo-400 text-sm font-medium flex items-center"><AlertCircle className="w-4 h-4 mr-1.5"/> To Do</p>
              <p className="text-4xl font-black text-white mt-4">{stats.toDoTasks}</p>
            </div>
          </div>
        </div>

        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 py-2 border-b border-slate-800 pb-6 print:hidden">
          <div className="flex items-center space-x-3">
            <div className="bg-slate-900/80 p-1 rounded-xl border border-slate-800 flex items-center">
              <button onClick={() => setViewMode('kanban')} className={`p-2 rounded-lg transition-all ${viewMode === 'kanban' ? 'bg-indigo-500 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}><LayoutGrid className="w-4 h-4" /></button>
              <button onClick={() => setViewMode('list')} className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-indigo-500 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}><List className="w-4 h-4" /></button>
            </div>
            
            <select className="bg-slate-900 border border-slate-700 text-slate-300 text-sm rounded-xl px-3 py-2 outline-none focus:ring-1 focus:ring-indigo-500" value={sortBy} onChange={e => setSortBy(e.target.value)}>
              <option value="default">Sort by: Default</option>
              <option value="priority">Sort by: Priority</option>
              <option value="dueDate">Sort by: Due Date</option>
            </select>
            
            {(searchQuery || myTasksOnly || sortBy !== 'default') && (
              <button onClick={() => {setSearchQuery(''); setMyTasksOnly(false); setSortBy('default');}} className="text-slate-400 hover:text-rose-400 flex items-center text-sm px-2">
                <FilterX className="w-4 h-4 mr-1" /> Clear Filters
              </button>
            )}
          </div>
          
          <div className="flex gap-3 items-center">
            <button onClick={exportToCSV} className="text-slate-400 hover:text-white p-2 rounded-lg hover:bg-slate-800 transition" title="Export CSV"><Download className="w-5 h-5" /></button>
            <button onClick={() => window.print()} className="text-slate-400 hover:text-white p-2 rounded-lg hover:bg-slate-800 transition" title="Print Board"><Printer className="w-5 h-5" /></button>
            
            {user.role === 'Admin' && (
              <>
                <button onClick={() => setShowProjectModal(true)} className="bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white px-4 py-2 rounded-xl text-sm font-bold transition-all shadow-lg hidden md:block">
                  New Project
                </button>
                {projects.length > 0 ? (
                  <button onClick={() => setShowTaskModal(true)} className="bg-gradient-to-r from-indigo-500 to-fuchsia-500 hover:from-indigo-400 hover:to-fuchsia-400 text-white px-5 py-2 rounded-xl text-sm font-bold flex items-center transition-all shadow-lg shadow-indigo-500/25">
                    <Plus className="w-4 h-4 mr-1.5" /> Task
                  </button>
                ) : (
                  <button onClick={() => toast('Please create a New Project first!', { icon: '⚠️', style: { background: '#1e293b', color: '#fff' } })} className="bg-slate-800 text-slate-500 cursor-not-allowed px-5 py-2 rounded-xl text-sm font-bold flex items-center shadow-lg">
                    <Plus className="w-4 h-4 mr-1.5" /> Task
                  </button>
                )}
              </>
            )}
          </div>
        </div>

        {/* Kanban View */}
        {viewMode === 'kanban' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {['To Do', 'In Progress', 'Done'].map(status => {
              const isCollapsed = collapsedCols[status];
              if (isCollapsed) {
                return (
                  <div key={status} className="glass-panel rounded-2xl p-4 flex flex-col items-center cursor-pointer hover:bg-slate-800/80 transition" onClick={() => setCollapsedCols({...collapsedCols, [status]: false})}>
                    <h3 className="font-bold text-slate-500 uppercase tracking-wider text-xs mb-4 rotate-90 mt-10 whitespace-nowrap">{status} ({filteredTasks.filter(t => t.status === status).length})</h3>
                    <div className="mt-auto rotate-90"><Plus className="w-4 h-4 text-slate-500"/></div>
                  </div>
                );
              }
              return (
                <div key={status} className="glass-panel rounded-3xl p-5 flex flex-col h-full min-h-[600px] border-t-4" style={{borderTopColor: status === 'Done' ? '#34d399' : status === 'In Progress' ? '#fbbf24' : '#818cf8'}} onDrop={(e) => handleDrop(e, status)} onDragOver={handleDragOver}>
                  <div className="flex justify-between items-center mb-6 px-1">
                    <div className="flex items-center space-x-2">
                      <h3 className="font-bold text-white tracking-wide text-sm">{status}</h3>
                      <span className="bg-slate-900 border border-slate-700 text-slate-400 text-xs font-bold px-2.5 py-0.5 rounded-full">{filteredTasks.filter(t => t.status === status).length}</span>
                    </div>
                    <button onClick={() => setCollapsedCols({...collapsedCols, [status]: true})} className="text-slate-500 hover:text-white transition"><X className="w-4 h-4"/></button>
                  </div>
                  <div className="space-y-4 flex-1 overflow-y-auto pr-1">
                    {filteredTasks.filter(t => t.status === status).map(task => (
                      <div key={task.id} draggable onDragStart={(e) => handleDragStart(e, task.id)} className={`bg-slate-900/60 border border-slate-700/50 p-5 rounded-2xl cursor-grab active:cursor-grabbing hover:border-indigo-500/30 hover:shadow-lg transition-all group ${isOverdue(task.dueDate) && task.status !== 'Done' ? 'border-rose-500/50 shadow-[inset_0_0_20px_rgba(244,63,94,0.05)]' : ''}`}>
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex items-center space-x-2 flex-wrap gap-y-2">
                            {getPriorityBadge(task.priority)}
                            {task.tags && task.tags.split(',').map((tag, i) => (
                              <span key={i} className="text-[10px] font-medium bg-slate-800 text-slate-300 px-2 py-0.5 rounded-md flex items-center"><Tag className="w-2.5 h-2.5 mr-1"/> {tag.trim()}</span>
                            ))}
                          </div>
                          <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => copyTaskLink(task.id)} className="text-slate-500 hover:text-indigo-400 p-1"><Copy className="w-3.5 h-3.5" /></button>
                            {user.role === 'Admin' && <button onClick={() => handleDeleteTask(task.id)} className="text-slate-500 hover:text-rose-400 p-1"><Trash2 className="w-3.5 h-3.5" /></button>}
                          </div>
                        </div>
                        
                        <h3 className="font-bold text-slate-100 leading-tight mb-2 text-sm mt-2">{task.title}</h3>
                        <p className="text-xs text-slate-500 mb-4 line-clamp-2 leading-relaxed">{task.description}</p>
                        
                        <div className="mt-4 pt-4 border-t border-slate-800/80 flex justify-between items-center text-xs">
                          <div className="flex items-center space-x-2">
                            <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(task.assignee?.name || '')}&background=random&color=fff&size=24`} className="rounded-full ring-2 ring-slate-800" title={task.assignee?.name} />
                            <span className="text-slate-400 font-medium truncate max-w-[80px]" title={task.Project?.name}>{task.Project?.name}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            {task.storyPoints > 0 && <span className="flex items-center text-indigo-400 font-bold bg-indigo-500/10 px-1.5 rounded"><Zap className="w-3 h-3 mr-0.5"/>{task.storyPoints}</span>}
                            {task.dueDate && (
                              <span className={`flex items-center font-medium ${isOverdue(task.dueDate) && task.status !== 'Done' ? 'text-rose-400' : 'text-slate-500'}`}>
                                <Calendar className="w-3 h-3 mr-1" /> {new Date(task.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                    {filteredTasks.filter(t => t.status === status).length === 0 && (
                      <div className="h-32 border-2 border-dashed border-slate-800 rounded-2xl flex items-center justify-center text-slate-600 text-sm font-medium">Drop here</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* List View */}
        {viewMode === 'list' && (
          <div className="glass-panel rounded-3xl overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-slate-900/80 border-b border-slate-700/50 text-slate-400 uppercase tracking-widest font-bold text-[10px]">
                  <tr>
                    <th className="p-5">ID / Task</th>
                    <th className="p-5">Status</th>
                    <th className="p-5">Priority</th>
                    <th className="p-5">Tags</th>
                    <th className="p-5">Project</th>
                    <th className="p-5">Assignee</th>
                    <th className="p-5">Due Date</th>
                    {user.role === 'Admin' && <th className="p-5 text-right">Actions</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {filteredTasks.map(task => (
                    <tr key={task.id} className="hover:bg-slate-800/40 transition-colors group">
                      <td className="p-5">
                        <div className="flex items-center space-x-3">
                          <span className="text-slate-600 font-mono text-xs">#{task.id}</span>
                          <div>
                            <p className="font-bold text-slate-200">{task.title}</p>
                            <p className="text-[10px] text-slate-500 mt-1 max-w-xs truncate">{task.description}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-5">
                        <select className="text-xs border border-slate-700 bg-slate-900 text-slate-300 rounded-lg px-3 py-1.5 font-bold focus:ring-1 focus:ring-indigo-500 outline-none" value={task.status} onChange={(e) => updateTaskStatus(task.id, e.target.value)}>
                          <option value="To Do">To Do</option>
                          <option value="In Progress">In Progress</option>
                          <option value="Done">Done</option>
                        </select>
                      </td>
                      <td className="p-5">{getPriorityBadge(task.priority)}</td>
                      <td className="p-5 text-xs text-slate-400">{task.tags || '-'}</td>
                      <td className="p-5 text-slate-300 font-medium">{task.Project?.name}</td>
                      <td className="p-5 flex items-center gap-2">
                        <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(task.assignee?.name || '')}&background=random&color=fff&size=20`} className="rounded-full" alt="" />
                        <span className="font-medium text-slate-300">{task.assignee?.name}</span>
                      </td>
                      <td className={`p-5 font-medium ${isOverdue(task.dueDate) && task.status !== 'Done' ? 'text-rose-400' : 'text-slate-500'}`}>
                        {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : '-'}
                      </td>
                      {user.role === 'Admin' && (
                        <td className="p-5 text-right opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => copyTaskLink(task.id)} className="text-slate-500 hover:text-indigo-400 p-1.5 mr-1"><Copy className="w-4 h-4" /></button>
                          <button onClick={() => handleDeleteTask(task.id)} className="text-slate-500 hover:text-rose-400 p-1.5 bg-slate-900 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Project Progress Section */}
        <div className="mt-12 mb-4">
          <h3 className="text-xl font-bold text-white mb-6 flex items-center"><BarChart2 className="w-5 h-5 mr-2 text-indigo-400"/> Project Portfolios</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map(p => {
              const progress = getProjectProgress(p.id);
              return (
                <div key={p.id} className="glass-card p-6 rounded-3xl relative group">
                  <div className="flex justify-between items-start mb-4">
                    <h4 className="font-bold text-white text-lg">{p.name}</h4>
                    {user.role === 'Admin' && (
                      <button onClick={() => handleDeleteProject(p.id)} className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-rose-400 transition p-1 bg-slate-900 rounded-lg">
                        <Archive className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  <p className="text-sm text-slate-400 mb-6 line-clamp-2">{p.description || 'No description provided.'}</p>
                  
                  <div className="mt-auto">
                    <div className="flex justify-between text-xs font-bold mb-2">
                      <span className="text-slate-400">Progress</span>
                      <span className={progress === 100 ? 'text-emerald-400' : 'text-indigo-400'}>{progress}%</span>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden">
                      <div className={`h-2.5 rounded-full transition-all duration-1000 ${progress === 100 ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'bg-gradient-to-r from-indigo-500 to-fuchsia-500'}`} style={{ width: `${progress}%` }}></div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>

      {/* Extensively detailed Task Modal */}
      {showTaskModal && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl p-8 w-full max-w-2xl shadow-2xl relative overflow-y-auto max-h-[90vh]">
            <h3 className="text-2xl font-bold mb-6 text-white flex items-center"><Zap className="w-6 h-6 mr-2 text-fuchsia-400"/> Assign New Task</h3>
            <form onSubmit={handleCreateTask} className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5">Task Title *</label>
                <input type="text" className="w-full p-3 bg-slate-950 border border-slate-700 rounded-xl text-white focus:ring-2 focus:ring-indigo-500 outline-none" value={newTask.title} onChange={e => setNewTask({...newTask, title: e.target.value})} required placeholder="E.g., Implement dark mode..." />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5">Description</label>
                <textarea rows="3" className="w-full p-3 bg-slate-950 border border-slate-700 rounded-xl text-white focus:ring-2 focus:ring-indigo-500 outline-none" value={newTask.description} onChange={e => setNewTask({...newTask, description: e.target.value})} placeholder="Markdown supported..."></textarea>
              </div>
              <div className="grid grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5">Project *</label>
                  <select className="w-full p-3 bg-slate-950 border border-slate-700 rounded-xl text-white focus:ring-2 focus:ring-indigo-500 outline-none" value={newTask.projectId} onChange={e => setNewTask({...newTask, projectId: e.target.value})} required>
                    <option value="">Select Project</option>
                    {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5">Assignee *</label>
                  <select className="w-full p-3 bg-slate-950 border border-slate-700 rounded-xl text-white focus:ring-2 focus:ring-indigo-500 outline-none" value={newTask.assigneeId} onChange={e => setNewTask({...newTask, assigneeId: e.target.value})} required>
                    <option value="">Assign To</option>
                    {users.map(u => <option key={u.id} value={u.id}>{u.name} ({u.role})</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5">Tags (Comma separated)</label>
                  <input type="text" className="w-full p-3 bg-slate-950 border border-slate-700 rounded-xl text-white focus:ring-2 focus:ring-indigo-500 outline-none" value={newTask.tags} onChange={e => setNewTask({...newTask, tags: e.target.value})} placeholder="frontend, bug, ui" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5">Priority</label>
                  <select className="w-full p-3 bg-slate-950 border border-slate-700 rounded-xl text-white focus:ring-2 focus:ring-indigo-500 outline-none" value={newTask.priority} onChange={e => setNewTask({...newTask, priority: e.target.value})}>
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-5">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5">Due Date</label>
                  <input type="date" className="w-full p-3 bg-slate-950 border border-slate-700 rounded-xl text-white focus:ring-2 focus:ring-indigo-500 outline-none" style={{colorScheme: 'dark'}} value={newTask.dueDate} onChange={e => setNewTask({...newTask, dueDate: e.target.value})} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5">Story Points</label>
                  <input type="number" min="0" className="w-full p-3 bg-slate-950 border border-slate-700 rounded-xl text-white focus:ring-2 focus:ring-indigo-500 outline-none" value={newTask.storyPoints} onChange={e => setNewTask({...newTask, storyPoints: parseInt(e.target.value)})} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5">Est. Hours</label>
                  <input type="number" min="0" className="w-full p-3 bg-slate-950 border border-slate-700 rounded-xl text-white focus:ring-2 focus:ring-indigo-500 outline-none" value={newTask.estimatedHours} onChange={e => setNewTask({...newTask, estimatedHours: parseInt(e.target.value)})} />
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-8 pt-6 border-t border-slate-800">
                <button type="button" onClick={() => setShowTaskModal(false)} className="px-6 py-3 text-slate-400 font-bold hover:text-white transition">Cancel</button>
                <button type="submit" className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-fuchsia-500 text-white font-bold rounded-xl shadow-lg hover:shadow-indigo-500/50 transition-all">Create Task</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Simple Project Modal */}
      {showProjectModal && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl p-8 w-full max-w-md shadow-2xl">
            <h3 className="text-2xl font-bold mb-6 text-white">Create Portfolio Project</h3>
            <form onSubmit={handleCreateProject} className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5">Project Name</label>
                <input type="text" className="w-full p-3 bg-slate-950 border border-slate-700 rounded-xl text-white focus:ring-2 focus:ring-indigo-500 outline-none" value={newProject.name} onChange={e => setNewProject({...newProject, name: e.target.value})} required />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5">Description</label>
                <textarea rows="3" className="w-full p-3 bg-slate-950 border border-slate-700 rounded-xl text-white focus:ring-2 focus:ring-indigo-500 outline-none" value={newProject.description} onChange={e => setNewProject({...newProject, description: e.target.value})}></textarea>
              </div>
              <div className="flex justify-end space-x-3 mt-8 pt-6 border-t border-slate-800">
                <button type="button" onClick={() => setShowProjectModal(false)} className="px-6 py-3 text-slate-400 font-bold hover:text-white transition">Cancel</button>
                <button type="submit" className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-fuchsia-500 text-white font-bold rounded-xl shadow-lg hover:shadow-indigo-500/50 transition-all">Create</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
