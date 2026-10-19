import {
    doc,
    setDoc,
    updateDoc,
    collection,
    query,
    onSnapshot,
    serverTimestamp
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import * as dom from '../dom';
import * as ui from '../ui';
import { state } from '../state';
import { escapeHtml } from '../utils';
import { loadPrivateSystemConfigForAdmin } from '../handlers-admin-system';
import {
    currentUser,
    userRecord,
    isUserOwner,
    isUserAdmin,
    isUserReseller,
    isOwnerEmail,
    OWNER_EMAILS,
    SUPER_ADMIN_EMAILS,
    SUPER_ADMIN_EMAIL,
    clearAdminAddUserMsg,
    adminUsersUnsubscribe,
    setAdminUsersUnsubscribe,
    isUrlOrLink
} from './session';
import {
    normalizeEmail,
    getEmailTypoWarning,
    TYPO_DOMAINS,
    syncKnownAuthUsers
} from './dedup';
import {
    approveUserWithResellerCheck,
    updateUserRole,
    updateUserStatus,
    deleteUserRecord,
    transferOwnership
} from './admin-users';

// Live Filter State
let searchFilter = '';
let roleFilter = 'all';
let statusFilter = 'all';

export function applyAdminFilters() {
    const rows = document.querySelectorAll('#admin-users-list tr.user-row');
    let visibleCount = 0;
    
    rows.forEach((row: any) => {
        const name = (row.dataset.name || '').toLowerCase();
        const email = (row.dataset.email || '').toLowerCase();
        const assignedBy = (row.dataset.assignedby || '').toLowerCase();
        const role = row.dataset.role || '';
        const status = row.dataset.status || '';
        const warning = row.dataset.warning === 'true';

        let match = true;

        if (searchFilter && !name.includes(searchFilter) && !email.includes(searchFilter) && !assignedBy.includes(searchFilter)) {
            match = false;
        }
        if (roleFilter !== 'all' && role !== roleFilter) {
            match = false;
        }
        if (statusFilter === 'warnings') {
            if (!warning) match = false;
        } else if (statusFilter !== 'all' && status !== statusFilter) {
            match = false;
        }

        row.style.display = match ? '' : 'none';
        if (match) visibleCount++;
    });

    const countEl = document.getElementById('admin-user-count');
    if (countEl) countEl.textContent = String(visibleCount);
}

export function openAdminPanel() {
    const isAdmin = isUserAdmin(currentUser, userRecord);
    const isReseller = !isAdmin && isUserReseller(userRecord);

    if (!currentUser || (!isAdmin && !isReseller)) {
        ui.showStatus('Unauthorized: administrator or reseller access required.', true, 3000);
        return;
    }

    clearAdminAddUserMsg();
    if (dom.adminPanel) dom.adminPanel.classList.remove('hidden');
    
    if (adminUsersUnsubscribe) {
        adminUsersUnsubscribe();
        setAdminUsersUnsubscribe(null);
    }

    const myUid = currentUser?.uid || '';

    // Auto-sync known accounts into Firestore when admin accesses the panel
    if (isAdmin) {
        loadPrivateSystemConfigForAdmin().catch(e => console.warn("Admin private config notice:", e));
        syncKnownAuthUsers(false).catch(e => console.warn("Admin auto-sync notice:", e));
    }

    // Update title
    const titleEl = document.getElementById('admin-panel-title');
    if (titleEl) {
        titleEl.textContent = isAdmin ? 'System Administration & Studio Control' : 'Reseller Quota & Member Approval';
    }

    // Bind Filter Controls
    const searchInput = document.getElementById('admin-user-search-input') as HTMLInputElement;
    const roleSelect = document.getElementById('admin-user-role-filter') as HTMLSelectElement;
    const statusSelect = document.getElementById('admin-user-status-filter') as HTMLSelectElement;

    if (searchInput) {
        searchInput.value = searchFilter;
        searchInput.addEventListener('input', (e) => {
            searchFilter = (e.target as HTMLInputElement).value.toLowerCase().trim();
            applyAdminFilters();
        });
    }
    if (roleSelect) {
        roleSelect.value = roleFilter;
        roleSelect.addEventListener('change', (e) => {
            roleFilter = (e.target as HTMLSelectElement).value;
            applyAdminFilters();
        });
    }
    if (statusSelect) {
        statusSelect.value = statusFilter;
        statusSelect.addEventListener('change', (e) => {
            statusFilter = (e.target as HTMLSelectElement).value;
            applyAdminFilters();
        });
    }

    // Hide/Show System tabs based on role
    const keysTab = document.getElementById('admin-tab-keys-btn');
    const creditsTab = document.getElementById('admin-tab-credits-btn');
    const maintenanceTab = document.getElementById('admin-tab-maintenance-btn');
    
    if (isReseller && !isAdmin) {
        keysTab?.classList.add('hidden');
        creditsTab?.classList.add('hidden');
        maintenanceTab?.classList.add('hidden');
    } else {
        keysTab?.classList.remove('hidden');
        creditsTab?.classList.remove('hidden');
        maintenanceTab?.classList.remove('hidden');
    }

    const usersRef = collection(db, 'users');
    const q = query(usersRef);

    const unsub = onSnapshot(q, (snapshot) => {
        const listEl = document.getElementById('admin-users-list');
        if (!listEl) return;
        listEl.innerHTML = '';
        
        const currentEmail = currentUser?.email?.toLowerCase().trim() || '';
        const currentUid = currentUser?.uid || '';
        const currentIsOwner = isUserOwner(currentUser, userRecord) || isOwnerEmail(currentEmail);
        const currentIsAdmin = isUserAdmin(currentUser, userRecord) || isOwnerEmail(currentEmail);
        const currentIsReseller = !currentIsAdmin && isUserReseller(userRecord);

        let approvedByMe = 0;
        let pendingCount = 0;

        snapshot.docs.forEach(d => {
            const data = d.data();
            const assignedClean = (data.assignedBy || '').trim().toLowerCase();
            const isAssigned = assignedClean && (assignedClean === currentEmail || (currentUid && assignedClean === currentUid.toLowerCase()));
            if (data.status === 'approved' && isAssigned) approvedByMe++;
            if (data.status === 'pending') pendingCount++;
        });

        const maxQuota = userRecord?.maxApprovedUsers || 5;

        // Pending Badge
        const pendingBadge = document.getElementById('admin-pending-count-badge');
        if (pendingBadge) {
            if (pendingCount > 0) {
                pendingBadge.textContent = `${pendingCount} Pending`;
                pendingBadge.classList.remove('hidden');
                pendingBadge.onclick = () => {
                    if (statusSelect) statusSelect.value = 'pending';
                    statusFilter = 'pending';
                    applyAdminFilters();
                };
            } else {
                pendingBadge.classList.add('hidden');
            }
        }

        // Reseller Sidebar Quota
        const quotaCard = document.getElementById('admin-quota-card');
        const quotaText = document.getElementById('admin-quota-text');
        if (currentIsReseller && quotaCard && quotaText) {
            quotaText.textContent = `You have approved ${approvedByMe} out of ${maxQuota} allowed accounts under your reseller quota.`;
        }

        if (snapshot.empty) {
            listEl.innerHTML = '<tr><td colspan="6" class="p-4 text-center text-slate-500">No users found.</td></tr>';
            return;
        }

        const renderedEmails = new Set<string>();
        let renderedCount = 0;

        const allEmailsInList = new Set<string>();
        snapshot.docs.forEach(d => {
            const dData = d.data();
            const e = normalizeEmail(dData.email || dData.displayName || d.id);
            if (e && e.includes('@')) allEmailsInList.add(e);
        });

        snapshot.forEach((docSnap) => {
            const data = docSnap.data();
            let userEmailClean = normalizeEmail(data.email || data.Email || '');
            if (!userEmailClean && data.displayName && data.displayName.includes('@')) {
                userEmailClean = normalizeEmail(data.displayName);
            }
            if (!userEmailClean && docSnap.id.includes('@')) {
                userEmailClean = normalizeEmail(docSnap.id);
            }
            
            const isDocOwner = isOwnerEmail(userEmailClean) || isOwnerEmail(data.email) || isOwnerEmail(docSnap.id) || (data.role === 'owner' && isOwnerEmail(userEmailClean));
            const isDocAdmin = !isDocOwner && (data.role === 'admin' || (SUPER_ADMIN_EMAILS.some(s => s.toLowerCase() === userEmailClean)));
            const userRole = isDocOwner ? 'owner' : (isDocAdmin ? 'admin' : (data.role || 'user'));
            const userStatus = isDocOwner ? 'approved' : (data.status || 'pending');

            const assignedByClean = (data.assignedBy || '').trim().toLowerCase();
            const isMe = (currentUid && docSnap.id === currentUid) || (currentEmail && userEmailClean === currentEmail);

            // Reseller view constraints
            if (!currentIsAdmin) {
                if (userRole === 'admin' || userEmailClean === SUPER_ADMIN_EMAIL.toLowerCase()) return;
                const isAssignedToMe = assignedByClean && (assignedByClean === currentEmail || (currentUid && assignedByClean === currentUid.toLowerCase()));
                if (!isMe && !isAssignedToMe) return;
            }
            
            if (userEmailClean) {
                if (renderedEmails.has(userEmailClean)) return;
                renderedEmails.add(userEmailClean);
            }

            renderedCount++;

            // Warnings
            const typoWarning = getEmailTypoWarning(userEmailClean);
            let typoTargetEmail = '';
            if (typoWarning) {
                const parts = userEmailClean.split('@');
                const targetDomain = TYPO_DOMAINS[parts[1]];
                if (targetDomain) {
                    const candidate = `${parts[0]}@${targetDomain}`;
                    if (allEmailsInList.has(candidate) && candidate !== userEmailClean) {
                        typoTargetEmail = candidate;
                    }
                }
            }

            const isSpamUrlName = isUrlOrLink(data.displayName || '');
            const hasWarning = !!typoTargetEmail || !!typoWarning || isSpamUrlName;

            const fallbackOwnerName = userEmailClean.includes('100') ? 'Bwaima 100' : 'Bwaima Twaima';
            const displayName = data.displayName || (data.email ? data.email.split('@')[0] : (isDocOwner ? fallbackOwnerName : 'User'));
            const initial = displayName.charAt(0).toUpperCase();

            const creditsVal = isDocOwner ? Math.max(data.credits || 0, 1000000) : (data.credits !== undefined ? data.credits : 10000);
            const renderMinutesVal = isDocOwner ? 999999 : (data.renderMinutesQuota !== undefined ? data.renderMinutesQuota : 10);
            const renderMinutesUsedVal = data.renderMinutesUsed || 0;
            const quotaVal = data.maxApprovedUsers ?? 5;

            const allowImageGen = isDocOwner ? true : (typeof data.allowImageGeneration === 'boolean' ? data.allowImageGeneration : (userRole === 'admin'));
            const allowAudioGen = isDocOwner ? true : (typeof data.allowAudioGeneration === 'boolean' ? data.allowAudioGeneration : (userRole === 'admin'));
            const allowVideoGen = isDocOwner ? true : (typeof data.allowVideoGeneration === 'boolean' ? data.allowVideoGeneration : (userRole === 'admin'));
            const allowCookieAuth = isDocOwner ? true : (typeof data.allowCookieAuth === 'boolean' ? data.allowCookieAuth : (userRole === 'admin'));

            const safeDisplayName = escapeHtml(displayName);
            const safeEmail = escapeHtml(data.email || userEmailClean || '');
            const safeDocId = escapeHtml(docSnap.id);

            const tr = document.createElement('tr');
            tr.className = `user-row border-b border-slate-800/50 hover:bg-slate-900/40 transition-colors ${typoTargetEmail ? 'bg-rose-950/20' : typoWarning ? 'bg-amber-950/10' : ''}`;
            tr.dataset.name = safeDisplayName.toLowerCase();
            tr.dataset.email = safeEmail.toLowerCase();
            tr.dataset.assignedby = assignedByClean;
            tr.dataset.role = userRole;
            tr.dataset.status = userStatus;
            tr.dataset.warning = String(hasWarning);

            // Column 1: Identity
            let warningHTML = '';
            if (isSpamUrlName) {
                warningHTML += `<span class="inline-block mt-1 text-[9px] bg-rose-950/80 text-rose-300 border border-rose-500/50 px-1.5 py-0.5 rounded">⚠️ Link in Name</span>`;
            }
            if (typoTargetEmail) {
                warningHTML += `<span class="inline-block mt-1 text-[9px] bg-rose-950/80 text-rose-300 border border-rose-500/50 px-1.5 py-0.5 rounded">⚠️ Typo duplicate of ${escapeHtml(typoTargetEmail)}</span>`;
            }

            // Column 2: Role & Quota
            let roleHTML = '';
            if (userRole === 'owner') {
                roleHTML = `<span class="px-2 py-1 rounded text-[10px] font-bold uppercase bg-amber-500/20 text-amber-300 border border-amber-500/50 inline-block shadow-sm">👑 Owner</span>`;
            } else if (currentIsAdmin) {
                roleHTML = `
                    <select class="role-select bg-slate-900 text-white border border-slate-700 rounded px-2 py-1 text-[11px] focus:border-purple-500 outline-none w-24 ${isMe ? 'opacity-50' : 'cursor-pointer'}" data-id="${safeDocId}" ${isMe ? 'disabled' : ''}>
                        <option value="user" ${userRole === 'user' ? 'selected' : ''}>User</option>
                        <option value="reseller" ${userRole === 'reseller' ? 'selected' : ''}>Reseller</option>
                        <option value="admin" ${userRole === 'admin' ? 'selected' : ''}>Admin</option>
                    </select>
                `;
            } else {
                roleHTML = `<span class="px-2 py-1 rounded text-[10px] font-bold uppercase bg-slate-800 text-slate-300 border border-slate-700">${userRole}</span>`;
            }

            let quotaHTML = '';
            if (userRole === 'reseller') {
                if (currentIsAdmin) {
                    quotaHTML = `
                        <div class="flex items-center gap-1 group">
                            <span class="text-[10px] text-slate-500">Limit:</span>
                            <input type="number" class="quota-input w-12 bg-slate-900 text-slate-300 font-mono text-[11px] border border-slate-700 rounded px-1.5 py-0.5 focus:border-purple-500 outline-none" value="${quotaVal}" data-id="${safeDocId}" data-saved="${quotaVal}">
                            <button class="save-quota-btn hidden bg-emerald-600 hover:bg-emerald-500 text-white px-1.5 py-0.5 rounded text-[9px] cursor-pointer" data-id="${safeDocId}">Save</button>
                        </div>
                    `;
                } else {
                    quotaHTML = `<div class="text-[10px] text-slate-400 font-mono mt-1">Quota: ${data.maxApprovedUsers ?? 5}</div>`;
                }
            }

            // Column 5: Capabilities
            const buildCapPill = (label: string, isAllowed: boolean, type: string) => {
                if (!currentIsAdmin || userRole === 'owner') {
                    return `<span class="px-1.5 py-0.5 rounded text-[9px] font-bold ${isAllowed ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-500/30' : 'bg-slate-800 text-slate-500 border border-slate-700'}">${label}</span>`;
                }
                return `
                    <label class="cursor-pointer relative group" title="Toggle ${label} Capability">
                        <input type="checkbox" class="peer sr-only cap-toggle" data-id="${safeDocId}" data-type="${type}" ${isAllowed ? 'checked' : ''}>
                        <span class="px-1.5 py-0.5 rounded text-[9px] font-bold transition-all peer-checked:bg-emerald-950/60 peer-checked:text-emerald-400 peer-checked:border-emerald-500/40 bg-slate-900 text-slate-500 border border-slate-700 hover:border-slate-500 block select-none">${label}</span>
                    </label>
                `;
            };

            const capPillsHTML = `
                ${buildCapPill('IMG', allowImageGen, 'image')}
                ${buildCapPill('AUD', allowAudioGen, 'audio')}
                ${buildCapPill('VID', allowVideoGen, 'video')}
                ${buildCapPill('COOKIE', allowCookieAuth, 'cookie')}
            `;

            // Column 6: Status & Actions
            let statusHTML = '';
            if (userRole === 'owner') {
                statusHTML = `<span class="text-[11px] font-semibold text-emerald-400 bg-emerald-950/50 border border-emerald-500/30 px-2 py-1 rounded">✓ Approved</span>`;
            } else if (currentIsAdmin) {
                statusHTML = `
                    <select class="status-select bg-slate-900 border border-slate-700 rounded px-2 py-1 text-[11px] focus:border-purple-500 outline-none w-24 ${userStatus === 'pending' ? 'text-amber-300' : userStatus === 'banned' ? 'text-rose-400' : 'text-slate-200'} ${isMe ? 'opacity-50' : 'cursor-pointer'}" data-id="${safeDocId}" ${isMe ? 'disabled' : ''}>
                        <option value="pending" ${userStatus === 'pending' ? 'selected' : ''}>Pending</option>
                        <option value="approved" ${userStatus === 'approved' ? 'selected' : ''}>Approved</option>
                        <option value="restricted" ${userStatus === 'restricted' ? 'selected' : ''}>Restricted</option>
                        <option value="rejected" ${userStatus === 'rejected' ? 'selected' : ''}>Rejected</option>
                        <option value="banned" ${userStatus === 'banned' ? 'selected' : ''}>Banned</option>
                    </select>
                `;
            } else {
                statusHTML = `<span class="text-[10px] font-bold uppercase px-2 py-1 rounded ${userStatus === 'approved' ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-500/30' : 'bg-amber-950/60 text-amber-400 border border-amber-500/30'}">${userStatus}</span>`;
            }

            let actionsHTML = '';
            if (currentIsOwner && userRole !== 'owner' && !isMe && userStatus === 'approved') {
                actionsHTML += `<button class="transfer-btn text-amber-400 hover:text-amber-300 bg-amber-950/30 hover:bg-amber-900/50 p-1.5 rounded transition cursor-pointer" data-id="${safeDocId}" data-email="${safeEmail}" title="Transfer Ownership">👑</button>`;
            }
            if ((currentIsAdmin || currentIsReseller) && userStatus === 'pending' && !isMe) {
                const isQuotaReached = currentIsReseller && approvedByMe >= maxQuota;
                actionsHTML += `<button class="approve-btn ${isQuotaReached ? 'bg-slate-800 text-slate-500 cursor-not-allowed' : 'bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer'} p-1.5 rounded transition text-[10px] font-bold" data-id="${safeDocId}" ${isQuotaReached ? 'disabled title="Quota Reached"' : 'title="Approve User"'}>✓</button>`;
            }
            if (currentIsAdmin && !isMe && userRole !== 'owner') {
                actionsHTML += `<button class="delete-btn text-rose-400 hover:text-rose-300 bg-rose-950/30 hover:bg-rose-900/50 p-1.5 rounded transition cursor-pointer" data-id="${safeDocId}" data-email="${safeEmail}" title="Delete Account">🗑️</button>`;
            }

            tr.innerHTML = `
                <td class="py-3 px-4">
                    <div class="flex items-center gap-3">
                        <div class="w-8 h-8 rounded-lg ${userRole === 'owner' ? 'bg-amber-950/80 text-amber-300 border border-amber-500/40' : 'bg-slate-800 text-slate-300 border border-slate-700'} flex items-center justify-center font-bold shrink-0 text-xs">
                            ${initial}
                        </div>
                        <div class="min-w-0">
                            ${currentIsAdmin ? `
                                <div class="flex items-center gap-1 group">
                                    <input type="text" class="username-admin-input bg-transparent text-slate-200 font-bold text-xs border-b border-transparent hover:border-slate-700 focus:border-purple-500 focus:bg-slate-900 outline-none w-full max-w-[150px] truncate" value="${safeDisplayName}" data-id="${safeDocId}" data-saved="${safeDisplayName}">
                                    <button class="save-username-btn hidden bg-purple-600 text-white px-1.5 py-0.5 rounded text-[9px] font-bold cursor-pointer shrink-0" data-id="${safeDocId}">Save</button>
                                </div>
                            ` : `
                                <span class="font-bold text-slate-200 text-xs truncate max-w-[150px] block">${safeDisplayName}</span>
                            `}
                            <div class="text-[10px] text-slate-500 font-mono truncate max-w-[180px] mt-0.5">${safeEmail}</div>
                        </div>
                    </div>
                    ${warningHTML}
                </td>
                <td class="py-3 px-3 align-top">
                    <div class="flex flex-col gap-1.5">
                        ${roleHTML}
                        ${quotaHTML}
                    </div>
                </td>
                <td class="py-3 px-3 align-top">
                    <div class="flex items-center gap-1.5 group">
                        <input type="number" min="0" step="500" class="credits-input w-20 bg-slate-900 text-amber-300 font-mono font-bold text-xs border border-slate-700 rounded px-2 py-1.5 focus:border-purple-500 outline-none" value="${creditsVal}" data-id="${safeDocId}" data-saved="${creditsVal}" ${currentIsAdmin ? '' : 'disabled'}>
                        ${currentIsAdmin ? `<button class="quick-add-10k-btn opacity-0 group-hover:opacity-100 transition-opacity bg-amber-950/80 text-amber-400 hover:text-amber-200 border border-amber-500/30 rounded px-1.5 py-1 text-[9px] font-bold cursor-pointer shrink-0" data-id="${safeDocId}" title="Add 10k">+10k</button>` : ''}
                    </div>
                    <button class="save-credits-btn hidden mt-1.5 w-20 bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-2 py-1 rounded text-[10px] transition-colors cursor-pointer shadow-md" data-id="${safeDocId}">Save</button>
                </td>
                <td class="py-3 px-3 align-top">
                    <div class="flex items-center gap-1.5 group">
                        <input type="number" min="0" step="10" class="render-minutes-input w-16 bg-slate-900 text-indigo-300 font-mono font-bold text-xs border border-slate-700 rounded px-2 py-1.5 focus:border-indigo-500 outline-none" value="${renderMinutesVal}" data-id="${safeDocId}" data-saved="${renderMinutesVal}" ${currentIsAdmin ? '' : 'disabled'}>
                        ${currentIsAdmin ? `<button class="quick-add-60m-btn opacity-0 group-hover:opacity-100 transition-opacity bg-indigo-950/80 text-indigo-400 hover:text-indigo-200 border border-indigo-500/30 rounded px-1.5 py-1 text-[9px] font-bold cursor-pointer shrink-0" data-id="${safeDocId}" title="Add 60 mins">+60m</button>` : ''}
                    </div>
                    <div class="text-[9px] text-slate-500 font-mono mt-1.5">Used: <span class="text-slate-300">${renderMinutesUsedVal}m</span></div>
                    <button class="save-render-minutes-btn hidden mt-1 w-16 bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-2 py-1 rounded text-[10px] transition-colors cursor-pointer shadow-md" data-id="${safeDocId}">Save</button>
                </td>
                <td class="py-3 px-3 align-top">
                    <div class="flex flex-wrap gap-1.5 w-32">
                        ${capPillsHTML}
                    </div>
                </td>
                <td class="py-3 px-4 text-right align-top">
                    <div class="flex items-center justify-end gap-2">
                        ${statusHTML}
                        ${actionsHTML}
                    </div>
                </td>
            `;
            listEl.appendChild(tr);
        });

        // Apply filters immediately after render
        applyAdminFilters();

        // ------------------ Dirty State Handlers ------------------
        listEl.querySelectorAll('input').forEach(input => {
            input.addEventListener('input', (e) => {
                const target = e.target as HTMLInputElement;
                const id = target.dataset.id;
                if (!id) return;

                if (target.classList.contains('credits-input')) {
                    const btn = target.parentElement?.parentElement?.querySelector('.save-credits-btn') as HTMLElement;
                    if (btn) btn.classList.toggle('hidden', target.value === target.dataset.saved);
                } else if (target.classList.contains('render-minutes-input')) {
                    const btn = target.parentElement?.parentElement?.querySelector('.save-render-minutes-btn') as HTMLElement;
                    if (btn) btn.classList.toggle('hidden', target.value === target.dataset.saved);
                } else if (target.classList.contains('quota-input')) {
                    const btn = target.parentElement?.querySelector('.save-quota-btn') as HTMLElement;
                    if (btn) btn.classList.toggle('hidden', target.value === target.dataset.saved);
                } else if (target.classList.contains('username-admin-input')) {
                    const btn = target.parentElement?.querySelector('.save-username-btn') as HTMLElement;
                    if (btn) btn.classList.toggle('hidden', target.value === target.dataset.saved);
                }
            });
        });

        // ------------------ Action Handlers ------------------
        
        // Save Name
        listEl.querySelectorAll('.save-username-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const target = e.currentTarget as HTMLButtonElement;
                const id = target.dataset.id!;
                const input = listEl.querySelector(`.username-admin-input[data-id="${id}"]`) as HTMLInputElement;
                if (!input) return;
                const newName = input.value.trim();
                target.textContent = '...';
                target.disabled = true;
                await updateDoc(doc(db, 'users', id), { displayName: newName, updatedAt: serverTimestamp() });
                input.dataset.saved = newName;
                target.classList.add('hidden');
                target.textContent = 'Save';
                target.disabled = false;
                ui.showStatus('Username updated.', false, 2000);
            });
        });

        // Save Credits
        listEl.querySelectorAll('.save-credits-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const target = e.currentTarget as HTMLButtonElement;
                const id = target.dataset.id!;
                const input = listEl.querySelector(`.credits-input[data-id="${id}"]`) as HTMLInputElement;
                if (!input) return;
                const newCredits = parseInt(input.value.trim(), 10);
                target.textContent = '...';
                target.disabled = true;
                await updateDoc(doc(db, 'users', id), { credits: newCredits, updatedAt: serverTimestamp() });
                if (currentUser && currentUser.uid === id) {
                    state.userCredits = newCredits;
                    localStorage.setItem('userCredits', String(newCredits));
                    ui.updateCreditsDisplay();
                }
                input.dataset.saved = String(newCredits);
                target.classList.add('hidden');
                target.textContent = 'Save';
                target.disabled = false;
                ui.showStatus(`Credits set to ${newCredits}`, false, 2000);
            });
        });

        // Save Render Mins
        listEl.querySelectorAll('.save-render-minutes-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const target = e.currentTarget as HTMLButtonElement;
                const id = target.dataset.id!;
                const input = listEl.querySelector(`.render-minutes-input[data-id="${id}"]`) as HTMLInputElement;
                if (!input) return;
                const newMins = parseInt(input.value.trim(), 10);
                target.textContent = '...';
                target.disabled = true;
                await updateDoc(doc(db, 'users', id), { renderMinutesQuota: newMins, updatedAt: serverTimestamp() });
                if (currentUser && currentUser.uid === id) state.renderMinutesQuota = newMins;
                input.dataset.saved = String(newMins);
                target.classList.add('hidden');
                target.textContent = 'Save';
                target.disabled = false;
                ui.showStatus(`Render quota set to ${newMins}m`, false, 2000);
            });
        });

        // Save Quota
        listEl.querySelectorAll('.save-quota-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const target = e.currentTarget as HTMLButtonElement;
                const id = target.dataset.id!;
                const input = listEl.querySelector(`.quota-input[data-id="${id}"]`) as HTMLInputElement;
                if (!input) return;
                const newQ = parseInt(input.value.trim(), 10);
                target.textContent = '...';
                target.disabled = true;
                await updateDoc(doc(db, 'users', id), { maxApprovedUsers: newQ, updatedAt: serverTimestamp() });
                input.dataset.saved = String(newQ);
                target.classList.add('hidden');
                target.textContent = 'Save';
                target.disabled = false;
                ui.showStatus(`Reseller quota updated.`, false, 2000);
            });
        });

        // Quick +10k
        listEl.querySelectorAll('.quick-add-10k-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const target = e.currentTarget as HTMLButtonElement;
                const id = target.dataset.id!;
                const input = listEl.querySelector(`.credits-input[data-id="${id}"]`) as HTMLInputElement;
                if (!input) return;
                const newCredits = (parseInt(input.value.trim(), 10) || 0) + 10000;
                target.disabled = true;
                await updateDoc(doc(db, 'users', id), { credits: newCredits, updatedAt: serverTimestamp() });
                input.value = String(newCredits);
                input.dataset.saved = String(newCredits);
                listEl.querySelector(`.save-credits-btn[data-id="${id}"]`)?.classList.add('hidden');
                ui.showStatus(`Added 10k credits!`, false, 2000);
                target.disabled = false;
            });
        });

        // Quick +60m
        listEl.querySelectorAll('.quick-add-60m-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const target = e.currentTarget as HTMLButtonElement;
                const id = target.dataset.id!;
                const input = listEl.querySelector(`.render-minutes-input[data-id="${id}"]`) as HTMLInputElement;
                if (!input) return;
                const newMins = (parseInt(input.value.trim(), 10) || 0) + 60;
                target.disabled = true;
                await updateDoc(doc(db, 'users', id), { renderMinutesQuota: newMins, updatedAt: serverTimestamp() });
                input.value = String(newMins);
                input.dataset.saved = String(newMins);
                listEl.querySelector(`.save-render-minutes-btn[data-id="${id}"]`)?.classList.add('hidden');
                ui.showStatus(`Added 60 render minutes!`, false, 2000);
                target.disabled = false;
            });
        });

        // Capability Toggles
        listEl.querySelectorAll('.cap-toggle').forEach(chk => {
            chk.addEventListener('change', async (e) => {
                const target = e.target as HTMLInputElement;
                const id = target.dataset.id!;
                const type = target.dataset.type!;
                const isAllowed = target.checked;
                const keyMap: any = {
                    'image': 'allowImageGeneration',
                    'audio': 'allowAudioGeneration',
                    'video': 'allowVideoGeneration',
                    'cookie': 'allowCookieAuth'
                };
                try {
                    await updateDoc(doc(db, 'users', id), { [keyMap[type]]: isAllowed, updatedAt: serverTimestamp() });
                    if (currentUser?.uid === id && userRecord) {
                        (userRecord as any)[keyMap[type]] = isAllowed;
                    }
                } catch (err) {
                    target.checked = !isAllowed;
                    ui.showStatus(`Failed to update capability.`, true, 3000);
                }
            });
        });

        // Status Select
        listEl.querySelectorAll('.status-select').forEach(sel => {
            sel.addEventListener('change', async (e) => {
                const target = e.target as HTMLSelectElement;
                target.disabled = true;
                await updateUserStatus(target.dataset.id!, target.value);
                target.disabled = false;
            });
        });

        // Role Select
        listEl.querySelectorAll('.role-select').forEach(sel => {
            sel.addEventListener('change', async (e) => {
                const target = e.target as HTMLSelectElement;
                target.disabled = true;
                await updateUserRole(target.dataset.id!, target.value);
                target.disabled = false;
            });
        });

        // Actions
        listEl.querySelectorAll('.approve-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const t = e.currentTarget as HTMLButtonElement;
                approveUserWithResellerCheck(t.dataset.id!, approvedByMe, maxQuota, currentIsReseller, currentIsAdmin);
            });
        });

        listEl.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const t = e.currentTarget as HTMLButtonElement;
                deleteUserRecord(t.dataset.id!, t.dataset.email!);
            });
        });

        listEl.querySelectorAll('.transfer-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const t = e.currentTarget as HTMLButtonElement;
                // Requires the transfer modal logic (unchanged from your original)
                openTransferOwnershipModal(t.dataset.id!, t.dataset.email!, t.dataset.email!);
            });
        });

    }, (err) => {
        handleFirestoreError(err, OperationType.LIST, 'users');
    });

    setAdminUsersUnsubscribe(unsub);
}

export function closeAdminPanel() {
    clearAdminAddUserMsg();
    const panel = document.getElementById('admin-panel');
    if (panel) panel.classList.add('hidden');
    if (adminUsersUnsubscribe) {
        adminUsersUnsubscribe();
        setAdminUsersUnsubscribe(null);
    }
}

// Keeping your original transfer ownership modal logic
function openTransferOwnershipModal(userId: string, userEmail: string, userName: string) {
    let modal = document.getElementById('transfer-ownership-modal');
    if (modal) modal.remove();

    modal = document.createElement('div');
    modal.id = 'transfer-ownership-modal';
    modal.className = 'fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in';
    
    const safeUserName = ui.escapeHtml(userName);
    const safeUserEmail = ui.escapeHtml(userEmail);

    modal.innerHTML = `
        <div class="bg-slate-900 border border-amber-800/80 rounded-2xl max-w-md w-full p-6 shadow-2xl text-slate-100 space-y-5 relative overflow-hidden">
            <div class="absolute -top-12 -right-12 w-32 h-32 bg-amber-600/10 rounded-full blur-2xl pointer-events-none"></div>
            <div class="flex items-center gap-3 border-b border-slate-800 pb-4">
                <div class="w-10 h-10 rounded-xl bg-amber-950/80 border border-amber-600/50 flex items-center justify-center text-amber-400 shrink-0 shadow-inner">👑</div>
                <div>
                    <h3 class="text-base font-bold text-amber-200 tracking-wide">Danger Zone: Transfer Ownership</h3>
                    <p class="text-xs text-amber-400/80">Permanent Workspace Role Change</p>
                </div>
            </div>
            <div class="bg-amber-950/30 border border-amber-800/40 rounded-xl p-3.5 text-xs text-amber-200/90 leading-relaxed space-y-2">
                <p>Transfer full <strong>Workspace Ownership</strong> to:</p>
                <div class="bg-slate-950/90 p-2.5 rounded-lg border border-amber-900/50 font-mono text-amber-300 flex items-center justify-between text-[11px]">
                    <span class="font-semibold">${safeUserName}</span>
                    <span class="text-slate-400">${safeUserEmail}</span>
                </div>
            </div>
            <div class="space-y-2">
                <label class="block text-xs font-medium text-slate-300">Type <code class="bg-slate-950 px-1.5 py-0.5 rounded text-amber-400 font-mono border border-slate-800">TRANSFER</code> to confirm:</label>
                <input type="text" id="transfer-confirm-input" placeholder="TRANSFER" class="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-amber-500 font-mono" />
            </div>
            <div class="flex items-center justify-end gap-3 pt-1">
                <button type="button" id="transfer-cancel-btn" class="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white transition-colors cursor-pointer">Cancel</button>
                <button type="button" id="transfer-submit-btn" disabled class="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed transition-all">Confirm Transfer</button>
            </div>
        </div>
    `;

    document.body.appendChild(modal);

    const input = modal.querySelector('#transfer-confirm-input') as HTMLInputElement;
    const submitBtn = modal.querySelector('#transfer-submit-btn') as HTMLButtonElement;
    const cancelBtn = modal.querySelector('#transfer-cancel-btn') as HTMLButtonElement;

    input?.focus();
    input?.addEventListener('input', () => {
        const val = input.value.trim();
        if (val === 'TRANSFER' || val.toLowerCase() === userEmail.toLowerCase()) {
            submitBtn.disabled = false;
            submitBtn.className = 'px-4 py-2 rounded-xl text-xs font-semibold bg-amber-600 hover:bg-amber-500 text-white shadow-lg shadow-amber-900/40 border border-amber-400 transition-all cursor-pointer';
        } else {
            submitBtn.disabled = true;
            submitBtn.className = 'px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed transition-all';
        }
    });

    cancelBtn?.addEventListener('click', () => modal?.remove());
    modal.addEventListener('click', (e) => { if (e.target === modal) modal.remove(); });

    submitBtn?.addEventListener('click', async () => {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Transferring...';
        modal?.remove();
        await transferOwnership(userId, userEmail, userName);
    });
}
