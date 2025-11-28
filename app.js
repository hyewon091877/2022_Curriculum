// 전역 변수
let curriculumData = null;
let activeElement = null;
let currentDomainName = null;
const STORAGE_KEY = 'curriculum_explorer_saved_data';

// DOM 요소
const fileInput = document.getElementById('file-input');
const loadScienceBtn = document.getElementById('load-science-btn');
const uploadSection = document.getElementById('upload-section');
const mainHeader = document.getElementById('main-header');
const mainContent = document.getElementById('main-content');
const mainFooter = document.getElementById('main-footer');
const subjectBadge = document.getElementById('subject-badge');
const schoolLevelBadge = document.getElementById('school-level-badge');
const pdfSource = document.getElementById('pdf-source');
const curriculumTree = document.getElementById('curriculum-tree');
const unitTitleContainer = document.getElementById('unit-title');
const unitActionsContainer = document.getElementById('unit-actions');
const achieveContent = document.getElementById('achieve-content');
const placeholderMessage = document.getElementById('placeholder-message');
const loadingSpinner = document.getElementById('loading-spinner');
const achievementList = document.getElementById('achievement-list');
const activitySection = document.getElementById('activity-section');
const activityList = document.getElementById('activity-list');
const explanationText = document.getElementById('explanation-text');
const considerationText = document.getElementById('consideration-text');
const processingIndicator = document.getElementById('processing-indicator');

// Tab 요소
const tabUpload = document.getElementById('tab-upload');
const tabSaved = document.getElementById('tab-saved');
const uploadTabContent = document.getElementById('upload-tab-content');
const savedTabContent = document.getElementById('saved-tab-content');
const savedList = document.getElementById('saved-list');

// 복사 버튼
const copyExplanationBtn = document.getElementById('copy-explanation-btn');
const copyConsiderationBtn = document.getElementById('copy-consideration-btn');

// Tab 전환
tabUpload.addEventListener('click', () => {
    tabUpload.classList.add('active');
    tabSaved.classList.remove('active');
    uploadTabContent.classList.remove('hidden');
    savedTabContent.classList.add('hidden');
});
tabSaved.addEventListener('click', () => {
    tabSaved.classList.add('active');
    tabUpload.classList.remove('active');
    savedTabContent.classList.remove('hidden');
    uploadTabContent.classList.add('hidden');
    loadSavedList(); // 저장된 목록 불러오기
});

// 파일 업로드 이벤트
fileInput.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const fileType = file.name.split('.').pop().toLowerCase();
    
    if (fileType === 'json') {
        handleJsonFile(file);
    } else if (fileType === 'pdf') {
        await handlePdfFile(file);
    } else {
        alert('JSON 또는 PDF 파일만 업로드 가능합니다.');
    }
});

// JSON 파일 처리
function handleJsonFile(file) {
    const reader = new FileReader();
    reader.onload = (event) => {
        try {
            curriculumData = JSON.parse(event.target.result);
            saveToStorage(curriculumData); // 로컬 스토리지에 저장
            initializeApp();
            showToast('JSON 파일이 성공적으로 로드되고 저장되었습니다! 🎉');
        } catch (error) {
            alert('파일 형식이 올바르지 않습니다. JSON 파일을 업로드해주세요.');
            console.error('JSON 파싱 오류:', error);
        }
    };
    reader.readAsText(file);
}

// PDF 파일 처리 (외부 API 필요)
async function handlePdfFile(file) {
    processingIndicator.classList.remove('hidden');
    
    // --- [PDF 분석 기능 대체 안내] ---
    // PDF를 JSON 데이터로 변환하는 것은 서버(백엔드)에서 AI 모델을 통해 처리해야 합니다.
    // GitHub Pages와 같은 정적 호스팅 환경에서는 이 기능을 직접 구현할 수 없습니다.
    // 기존 코드의 Claude API 호출은 주석 처리하고, 사용자에게 안내합니다.
    
    await new Promise(resolve => setTimeout(resolve, 2000)); // 2초 대기 후 안내
    
    processingIndicator.classList.add('hidden');
    alert(`[중요] PDF 분석 실패:
PDF 파일을 교육과정 데이터로 분석하려면 외부 AI API 호출(예: Claude, ChatGPT) 또는 백엔드 서버가 필요합니다.
현재 환경에서는 이 기능을 사용할 수 없습니다.

대신, 미리 준비된 **교육과정 JSON 파일을 업로드**하거나, '과학과 샘플 불러오기'를 사용해 주세요.`);
    
    // 원본 코드의 로직은 여기에 있었습니다.
    /*
    try {
        const base64Data = await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result.split(',')[1]);
            reader.onerror = () => reject(new Error('파일 읽기 실패'));
            reader.readAsDataURL(file);
        });

        // ⚠️ 이 부분은 실제 API 키와 백엔드 구성이 필요합니다.
        const response = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                // 'x-api-key': 'YOUR_API_KEY' // 실제 키 필요
            },
            body: JSON.stringify({
                model: 'claude-sonnet-4-20250514',
                // ... (생략된 API 호출 파라미터)
            })
        });
        // ... (생략된 응답 처리 및 saveToStorage 호출)
        
    } catch (error) {
        console.error('PDF 처리 오류:', error);
        alert('PDF 분석 중 오류가 발생했습니다. JSON 파일을 직접 업로드해주세요.\n\n오류: ' + error.message);
    } finally {
        processingIndicator.classList.add('hidden');
    }
    */
}

// 로컬 스토리지에 저장
function saveToStorage(data) {
    try {
        const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
        const key = `${data.subject}_${data.schoolLevel}_${data.pdfFile || 'default'}`;
        saved[key] = {
            ...data,
            savedAt: new Date().toISOString()
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
    } catch (error) {
        console.error('저장 오류:', error);
    }
}

// 저장된 목록 불러오기
function loadSavedList() {
    try {
        const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
        const items = Object.entries(saved);
        
        if (items.length === 0) {
            savedList.innerHTML = '<p class="text-center text-slate-500">저장된 교과가 없습니다</p>';
            return;
        }
        
        savedList.innerHTML = items.map(([key, data]) => {
            const date = new Date(data.savedAt);
            const dateStr = date.toLocaleDateString('ko-KR', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
            
            return `
                <div class="saved-item-card" data-key="${key}">
                    <div class="flex justify-between items-center">
                        <div class="flex-1" onclick="loadSavedData('${key}')">
                            <h3 class="font-bold text-lg text-slate-800">${data.subject} (${data.pdfFile || '파일없음'})</h3>
                            <p class="text-sm text-slate-600">${data.schoolLevel}</p>
                            <p class="text-xs text-slate-400 mt-1">저장일: ${dateStr}</p>
                        </div>
                        <button class="delete-btn" onclick="deleteSavedData(event, '${key}')">삭제</button>
                    </div>
                </div>
            `;
        }).join('');
        
    } catch (error) {
        console.error('목록 로드 오류:', error);
        savedList.innerHTML = '<p class="text-center text-red-500">목록을 불러올 수 없습니다</p>';
    }
}

// 저장된 데이터 불러오기
window.loadSavedData = function(key) {
    try {
        const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
        curriculumData = saved[key];
        if (curriculumData) {
            initializeApp();
            showToast(`${curriculumData.subject} (${curriculumData.schoolLevel})을 불러왔습니다!`);
        }
    } catch (error) {
        console.error('데이터 로드 오류:', error);
        alert('데이터를 불러올 수 없습니다.');
    }
};

// 저장된 데이터 삭제
window.deleteSavedData = function(event, key) {
    event.stopPropagation();
    if (!confirm('정말 삭제하시겠습니까?')) return;
    
    try {
        const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
        delete saved[key];
        localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
        loadSavedList();
        showToast('삭제되었습니다');

        // 현재 로드된 데이터가 삭제된 경우 초기화
        const currentKey = `${curriculumData?.subject}_${curriculumData?.schoolLevel}_${curriculumData?.pdfFile || 'default'}`;
        if (currentKey === key) {
            location.reload(); // 페이지 새로고침으로 초기 화면으로 돌아가기
        }

    } catch (error) {
        console.error('삭제 오류:', error);
        alert('삭제 중 오류가 발생했습니다.');
    }
};

// 과학과 샘플 데이터 불러오기
loadScienceBtn.addEventListener('click', async () => {
    loadingSpinner.classList.remove('hidden');
    placeholderMessage.classList.remove('hidden');

    // 샘플 JSON 데이터를 별도로 fetch하여 로드
    // 실제 배포 시에는 'science_data.json' 파일을 해당 경로에 준비해야 합니다.
    try {
        const response = await fetch('science_data.json'); 
        curriculumData = await response.json();
        curriculumData.pdfFile = "science_data.json (샘플)";
        saveToStorage(curriculumData);
        initializeApp();
        showToast('과학과 샘플 데이터가 로드되고 저장되었습니다! 💾');
    } catch (error) {
        alert('샘플 데이터를 불러올 수 없습니다. science_data.json 파일을 확인해주세요.');
        console.error('샘플 데이터 로딩 오류:', error);
    } finally {
        loadingSpinner.classList.add('hidden');
    }
});

// 앱 초기화
function initializeApp() {
    if (!curriculumData || !curriculumData.subject || !curriculumData.schoolLevel || !curriculumData.units) {
        alert('데이터 형식이 올바르지 않습니다.');
        return;
    }
    uploadSection.classList.add('hidden');
    mainHeader.classList.remove('hidden');
    mainContent.classList.remove('hidden');
    mainFooter.classList.remove('hidden');
    
    subjectBadge.textContent = curriculumData.subject;
    schoolLevelBadge.textContent = curriculumData.schoolLevel;
    pdfSource.textContent = curriculumData.pdfFile || '업로드된 파일';
    
    renderCurriculumTree();
    placeholderMessage.classList.remove('hidden');
    achieveContent.classList.add('hidden');
    // 초기에는 아무 단원도 선택되지 않은 상태로 둡니다.
    setActiveElement(null); 
}

// 트리 렌더링
function renderCurriculumTree() {
    curriculumTree.innerHTML = '';
    const units = curriculumData.units;
    
    // 학년별/영역별 그룹화
    const groupedUnits = {};
    for (const [yearKey, yearData] of Object.entries(units)) {
        groupedUnits[yearKey] = yearData;
    }

    for (const [yearName, yearUnits] of Object.entries(groupedUnits)) {
        const groupHeader = createGroupHeader(yearName);
        const subGroupContainer = createSubGroupContainer();
        groupHeader.addEventListener('click', () => toggleGroup(groupHeader, subGroupContainer));

        for (const unitName of Object.keys(yearUnits).sort()) {
            const unitData = yearUnits[unitName];
            const unitItem = createUnitItem(unitName, yearName, unitData);
            unitItem.addEventListener('click', function() {
                setActiveElement(this);
                displayUnitContent(unitData, unitName, yearName);
            });
            subGroupContainer.appendChild(unitItem);
        }

        const wrapper = document.createElement('div');
        wrapper.appendChild(groupHeader);
        wrapper.appendChild(subGroupContainer);
        curriculumTree.appendChild(wrapper);
    }
}

// 그룹 헤더 생성
function createGroupHeader(title) {
    const header = document.createElement('div');
    header.className = 'tree-group-item';
    header.innerHTML = `<span class="toggle-icon">&gt;</span> <span>${title}</span>`;
    return header;
}

// 서브 그룹 컨테이너 생성
function createSubGroupContainer() {
    const content = document.createElement('div');
    content.className = 'sub-group-container';
    return content;
}

// 그룹 토글
function toggleGroup(headerElement, contentElement) {
    if (!contentElement) return;
    const iconContainer = headerElement.querySelector('.toggle-icon');
    
    const isOpen = contentElement.classList.contains('open');
    if (isOpen) {
        contentElement.classList.remove('open');
        if (iconContainer) iconContainer.classList.remove('open-icon');
    } else {
        contentElement.classList.add('open');
        if (iconContainer) iconContainer.classList.add('open-icon');
    }
}

// 단원 항목 생성
function createUnitItem(unitName, yearName, unitData) {
    const item = document.createElement('div');
    item.className = 'sub-group-item';
    item.textContent = unitName;
    item.dataset.unitName = unitName;
    item.dataset.yearName = yearName;
    item.dataset.domain = unitData.domain;
    return item;
}

// 활성 요소 설정
function setActiveElement(newActiveElement) {
    if (activeElement) {
        activeElement.classList.remove('active-item');
    }
    if (newActiveElement) {
        newActiveElement.classList.add('active-item');
        activeElement = newActiveElement;
    } else {
        activeElement = null;
    }
}

// 단원 내용 표시
function displayUnitContent(data, unitName, yearName) {
    loadingSpinner.classList.remove('hidden');
    placeholderMessage.classList.remove('hidden');
    achieveContent.classList.add('hidden');

    setTimeout(() => {
        loadingSpinner.classList.add('hidden');
        placeholderMessage.classList.add('hidden');
        achieveContent.classList.remove('hidden');

        // Unit Header Update
        unitTitleContainer.textContent = unitName;
        currentDomainName = data.domain || '';
        document.getElementById('current-domain-display').textContent = data.domain ? `(${data.domain})` : '';

        // Action Buttons (PDF Links)
        unitActionsContainer.innerHTML = '';
        if (data.pdfPages) {
            if (data.pdfPages.achievement) {
                const achieveBtn = createActionButton('성취수준 보기', 'book-open', () => showAchievementLevel(unitName, data.pdfPages.achievement));
                unitActionsContainer.appendChild(achieveBtn);
            }
            if (data.pdfPages.domain && data.domain) {
                const domainBtn = createActionButton(`${data.domain} 해설 보기`, 'file-text', () => showDomainLevel(data.domain, data.pdfPages.domain));
                unitActionsContainer.appendChild(domainBtn);
            }
        }
        
        // 1. Achievement List
        if (data.achievements && data.achievements.length > 0) {
            achievementList.innerHTML = data.achievements.map(item => `
                <li class="content-list-item">
                    <span>${item}</span>
                </li>
            `).join('');
        } else {
             achievementList.innerHTML = `<li class="content-list-item" style="color: #64748b;">선택하신 단원에 대한 성취기준 데이터가 없습니다.</li>`;
        }
        
        // 2. Activity List (activity-list-item-black-bullet for black dot bullet)
        if (data.activities && data.activities.length > 0) {
            activitySection.classList.remove('hidden');
            activityList.innerHTML = data.activities.map(item => `
                <li class="activity-list-item-black-bullet">
                    <span>${item}</span>
                </li>
            `).join('');
        } else {
            activitySection.classList.add('hidden');
            activityList.innerHTML = '';
        }

        // 3. Explanation and Consideration Texts (formatPdfText for blue bullet/code prefix)
        explanationText.innerHTML = formatPdfText(data.explanation);
        considerationText.innerHTML = formatPdfText(data.consideration);
        
        // Scroll to top of detail view
        document.getElementById('unit-content').scrollTo(0, 0);

    }, 300); 
}

// PDF 링크 모달 관련 함수 (index.html에서 onclick으로 사용됨)
window.showAchievementLevel = function(unitName, page) {
    const pdfFile = curriculumData.pdfFile || '교육과정_문서.pdf';
    openModal(`${unitName} : 수준별 성취수준`, pdfFile, page);
}

window.showDomainLevel = function(domainName, page) {
    const pdfFile = curriculumData.pdfFile || '교육과정_문서.pdf';
    openModal(`${domainName} 해설`, pdfFile, page);
}

function openModal(title, pdfLink, pageNumber) {
    const modal = document.getElementById('pdf-modal');
    const modalTitle = document.getElementById('modal-title');
    const modalBody = document.getElementById('modal-body');
    
    modalTitle.textContent = title;
    // GitHub Pages에서 PDF 파일을 호스팅할 경우, 파일명을 사용하여 링크를 생성합니다.
    // pdfLink는 curriculumData.pdfFile에 저장된 파일명을 사용합니다.
    // PDF 뷰어에 따라 #page=n 옵션이 작동하지 않을 수 있습니다.
    const finalLink = `${pdfLink}#page=${pageNumber}`;

    modalBody.innerHTML = `
        <p class="text-slate-700 mb-4">
            PDF 파일의 <span class="font-bold text-lg text-blue-600">${pageNumber}페이지</span>로 바로 이동을 시도합니다.<br>
            브라우저 설정에 따라 새 탭에서 열릴 수 있습니다.
        </p>
        <a href="${finalLink}" target="_blank" class="px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors inline-block shadow-lg">
            PDF 파일 열기 (${pdfLink})
        </a>
    `;
    modal.classList.remove('hidden');
}

window.closeModal = function() {
    document.getElementById('pdf-modal').classList.add('hidden');
}


// 텍스트 포맷팅 유틸리티
function formatPdfText(text) {
    if (!text) return '<p class="text-slate-500">제공되는 해설/고려사항 데이터가 없습니다.</p>';

    // 1. 줄바꿈(\n)을 기준으로 배열로 분리
    const lines = text.split('\n').filter(line => line.trim() !== '');

    // 2. 각 라인을 <div class="explanation-item">으로 래핑
    const formattedLines = lines.map(line => {
        line = line.trim();
        let content = line;
        let prefix = '<span class="bullet">•</span>'; // 기본은 파란색 불릿

        // 코드 prefix ([0000]) 처리
        const codeMatch = line.match(/^(\[[\w\s\d-]+\])\s*(.*)/);
        if (codeMatch) {
            prefix = `<span class="code">${codeMatch[1]}</span>`;
            content = codeMatch[2];
        } 
        // 하이픈(-) 불릿 처리 (일반 텍스트)
        else if (line.startsWith('- ')) {
            prefix = '<span class="bullet">―</span>';
            content = line.substring(2).trim();
        }

        return `<div class="explanation-item">${prefix}<span>${content}</span></div>`;
    }).join('');

    return formattedLines;
}

// 버튼 생성 유틸리티
function createActionButton(text, icon, onClick) {
    const button = document.createElement('button');
    button.className = 'px-4 py-1.5 bg-blue-50 text-blue-700 font-semibold rounded-lg hover:bg-blue-100 transition-colors';
    // 간단한 아이콘은 텍스트로 대체하거나 Tailwind Heroicons를 사용해야 합니다.
    // 여기서는 간단히 텍스트 아이콘을 사용합니다.
    const iconMap = {
        'book-open': '📖',
        'file-text': '📝'
    };
    button.innerHTML = `${iconMap[icon] || ''} ${text}`;
    button.onclick = onClick;
    return button;
}

// 클립보드 복사 유틸리티
function copyToClipboard(text, message) {
    navigator.clipboard.writeText(text).then(() => {
        showToast(message);
    }).catch(err => {
        console.error('클립보드 복사 실패:', err);
        alert('텍스트 복사 실패!');
    });
}

// HTML 태그 제거 (복사 시 사용)
function stripHtmlTags(html) {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    // 줄바꿈을 위해 <br>이나 <div> 등을 기준으로 구분하고 텍스트를 추출
    return tempDiv.textContent.replace(/(\n\s*){2,}/g, '\n\n').trim();
}

// 토스트 메시지 표시
function showToast(message) {
    const toast = document.createElement('div');
    toast.textContent = message;
    toast.style.cssText = `
        position: fixed;
        bottom: 20px;
        left: 50%;
        transform: translateX(-50%);
        background-color: #1f2937;
        color: white;
        padding: 12px 24px;
        border-radius: 8px;
        font-weight: 600;
        box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
        z-index: 1000;
        opacity: 0;
        animation: slideIn 0.3s ease-out forwards;
    `;
    document.body.appendChild(toast);
    setTimeout(() => {
        toast.style.animation = 'slideOut 0.3s ease-out forwards';
        setTimeout(() => toast.remove(), 300);
    }, 2000);
}

// 복사 버튼 이벤트 리스너 설정
function setupCopyButtons() {
    copyExplanationBtn.onclick = () => {
        const textToCopy = explanationText.innerText;
        copyToClipboard(textToCopy, '해설이 복사되었습니다');
    };
    copyConsiderationBtn.onclick = () => {
        const textToCopy = considerationText.innerText;
        copyToClipboard(textToCopy, '고려사항이 복사되었습니다');
    };
}

// 앱 시작 시 초기화
document.addEventListener('DOMContentLoaded', () => {
    // 로컬 스토리지에 저장된 목록이 있다면 '저장된 교과 불러오기' 탭을 활성화할 수 있도록 합니다.
    loadSavedList();
    
    // 만약 로드된 데이터가 있다면 앱을 초기화합니다.
    // (예: 새로고침 후 로드할 수 있는 로직이 없으므로, 초기에는 업로드 화면을 유지합니다.)
    
    setupCopyButtons();
});

// CSS 애니메이션 추가 (Toast용)
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translate(-50%, 100%); opacity: 0; }
        to { transform: translate(-50%, 0); opacity: 1; }
    }
    @keyframes slideOut {
        from { transform: translate(-50%, 0); opacity: 1; }
        to { transform: translate(-50%, 100%); opacity: 0; }
    }
`;
document.head.appendChild(style);