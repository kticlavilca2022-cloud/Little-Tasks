const $ = (id) => document.getElementById(id);
const config = window.APP_CONFIG;
const configured = config && /^https:\/\/[^/]+\.supabase\.co$/.test(config.supabaseUrl) && config.supabaseAnonKey && !config.supabaseAnonKey.includes('YOUR_');
const db = configured ? window.supabase.createClient(config.supabaseUrl, config.supabaseAnonKey) : null;
let user = null;
let tasks = [];
let editingId = null;
let signup = false;

function notice(message, error = false) {
  $('notice').textContent = message;
  $('notice').classList.toggle('error', error);
  $('notice').hidden = !message;
}
function busy(button, value) { button.disabled = value; }
function showView() {
  $('auth-view').hidden = !!user;
  $('app-view').hidden = !user;
  $('signed-in-as').textContent = user ? `Signed in as ${user.email}` : '';
  if (!user) { tasks = []; editingId = null; renderTasks(); }
}
function resetForm() {
  editingId = null;
  $('task-form').reset();
  $('form-title').textContent = 'Add a task';
  $('save-task').textContent = 'Add task';
  $('cancel-edit').hidden = true;
}
function renderTasks() {
  $('task-count').textContent = `${tasks.length} ${tasks.length === 1 ? 'task' : 'tasks'}`;
  $('empty-state').hidden = tasks.length > 0;
  $('task-list').replaceChildren();
  for (const task of tasks) {
    const li = document.createElement('li'); li.className = `task${task.completed ? ' done' : ''}`;
    const check = document.createElement('input'); check.type = 'checkbox'; check.className = 'check'; check.checked = task.completed; check.setAttribute('aria-label', `Mark ${task.title} ${task.completed ? 'incomplete' : 'complete'}`);
    check.addEventListener('change', () => updateTask(task.id, { completed: check.checked }));
    const main = document.createElement('div'); main.className = 'task-main';
    const name = document.createElement('div'); name.className = 'task-name'; name.textContent = task.title; main.append(name);
    if (task.details) { const details = document.createElement('p'); details.className = 'task-details'; details.textContent = task.details; main.append(details); }
    const actions = document.createElement('div'); actions.className = 'task-actions';
    const edit = document.createElement('button'); edit.type = 'button'; edit.className = 'outline'; edit.textContent = 'Edit'; edit.addEventListener('click', () => {
      editingId = task.id; $('task-title').value = task.title; $('task-details').value = task.details;
      $('form-title').textContent = 'Edit task'; $('save-task').textContent = 'Save changes'; $('cancel-edit').hidden = false;
      $('task-title').focus(); window.scrollTo({ top: 0, behavior: 'smooth' });
    });
    const remove = document.createElement('button'); remove.type = 'button'; remove.className = 'outline'; remove.textContent = 'Delete'; remove.addEventListener('click', () => deleteTask(task.id));
    actions.append(edit, remove); li.append(check, main, actions); $('task-list').append(li);
  }
}
async function loadTasks() {
  if (!user) return;
  const { data, error } = await db.from('tasks').select('id,title,details,completed,created_at').eq('user_id', user.id).order('created_at', { ascending: false });
  if (error) return notice(error.message, true);
  tasks = data; renderTasks();
}
async function updateTask(id, changes) {
  const { error } = await db.from('tasks').update(changes).eq('id', id).eq('user_id', user.id);
  if (error) notice(error.message, true); else notice('Task updated.');
  await loadTasks();
}
async function deleteTask(id) {
  if (!window.confirm('Delete this task?')) return;
  const { error } = await db.from('tasks').delete().eq('id', id).eq('user_id', user.id);
  if (error) return notice(error.message, true);
  if (editingId === id) resetForm();
  notice('Task deleted.'); await loadTasks();
}
document.addEventListener('DOMContentLoaded', async () => {
  if (!db) { notice('Setup needed: copy config.example.js to config.js and add your Supabase URL and public key.', true); $('auth-submit').disabled = true; return; }
  $('auth-toggle').addEventListener('click', () => {
    signup = !signup; $('auth-title').textContent = signup ? 'Create an account' : 'Welcome back';
    $('auth-submit').textContent = signup ? 'Sign up' : 'Log in';
    $('auth-prompt').textContent = signup ? 'Already have an account?' : 'New here?';
    $('auth-toggle').textContent = signup ? 'Log in' : 'Create an account';
    $('password').autocomplete = signup ? 'new-password' : 'current-password'; notice('');
  });
  $('auth-form').addEventListener('submit', async (event) => {
    event.preventDefault(); busy($('auth-submit'), true); notice('');
    const email = $('email').value.trim(), password = $('password').value;
    const { data, error } = signup ? await db.auth.signUp({ email, password }) : await db.auth.signInWithPassword({ email, password });
    busy($('auth-submit'), false);
    if (error) return notice(error.message, true);
    if (signup && !data.session) notice('Account created. Check your email to confirm it, then log in.');
    else { user = data.user; showView(); await loadTasks(); notice(signup ? 'Account created!' : 'Welcome back!'); }
  });
  $('logout').addEventListener('click', async () => {
    const { error } = await db.auth.signOut();
    if (error) return notice(error.message, true);
    user = null; showView(); resetForm(); notice('Logged out.');
  });
  $('cancel-edit').addEventListener('click', resetForm);
  $('task-form').addEventListener('submit', async (event) => {
    event.preventDefault(); if (!user) return;
    const title = $('task-title').value.trim(), details = $('task-details').value.trim();
    if (!title) return notice('Please enter a task title.', true);
    busy($('save-task'), true);
    const result = editingId
      ? await db.from('tasks').update({ title, details }).eq('id', editingId).eq('user_id', user.id)
      : await db.from('tasks').insert({ user_id: user.id, title, details });
    busy($('save-task'), false);
    if (result.error) return notice(result.error.message, true);
    notice(editingId ? 'Task updated.' : 'Task added.'); resetForm(); await loadTasks();
  });
  const { data: { user: activeUser } } = await db.auth.getUser();
  user = activeUser; showView(); if (user) await loadTasks();
  db.auth.onAuthStateChange((_event, session) => {
    if (session?.user?.id === user?.id) return;
    user = session?.user || null; showView(); if (user) setTimeout(loadTasks, 0);
  });
});
