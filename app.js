// 전역 변수
let curriculumData = null;
let activeElement = null;
let currentDomainName = null;

// DOM 요소
const fileInput = document.getElementById('file-input');
const loadScienceBtn = document.getElementById('load-science-btn');
const uploadSection = document.getElementById('upload-section');
const mainHeader = document.getElementById('main-header');
const mainContent = document.getElementById('main-content');
const mainFooter = document.getElementById('main-footer');
const subjectBadge = document.getElementById('subject-badge');
const schoolLevelBadge = document.getElementById('school-level-badge');
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

// 파일 업로드 이벤트
fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                curriculumData = JSON.parse(event.target.result);
                initializeApp();
            } catch (error) {
                alert('파일 형식이 올바르지 않습니다. JSON 파일을 업로드해주세요.');
                console.error('JSON 파싱 오류:', error);
            }
        };
        reader.readAsText(file);
    }
});

// 과학과 샘플 데이터 불러오기
loadScienceBtn.addEventListener('click', async () => {
    try {
        const response = await fetch('science_data.json');
        curriculumData = await response.json();
        initializeApp();
    } catch (error) {
        alert('샘플 데이터를 불러올 수 없습니다. science_data.json 파일을 확인해주세요.');
        console.error('샘플 데이터 로딩 오류:', error);
    }
});

// 앱 초기화
function initializeApp() {
    if (!curriculumData || !curriculumData.subject || !curriculumData.schoolLevel || !curriculumData.units) {
        alert('데이터 형식이 올바르지 않습니다.');
        return;
    }

    // UI 표시
    uploadSection.classList.add('hidden');
    mainHeader.classList.remove('hidden');
    mainContent.classList.remove('hidden');
    mainFooter.classList.remove('hidden');

    // 헤더 정보 업데이트
    subjectBadge.textContent = curriculumData.subject;
    schoolLevelBadge.textContent = curriculumData.schoolLevel;

    // 트리 렌더링
    renderCurriculumTree();
}

// 트리 렌더링
function renderCurriculumTree() {
    curriculumTree.innerHTML = '';
    const units = curriculumData.units;

    // 학년별 그룹화
    const groupedUnits = {};
    for (const [yearKey, yearData] of Object.entries(units)) {
        groupedUnits[yearKey] = yearData;
    }

    // 각 학년 렌더링
    for (const [yearName, yearUnits] of Object.entries(groupedUnits)) {
        const yearContainer = document.createElement('div');
        yearContainer.className = 'mb-3';
        
        const yearHeader = document.createElement('div');
        yearHeader.className = 'tree-group-item flex items-center text-base font-extrabold text-slate-800';
        yearHeader.innerHTML = `<span class="toggle-icon open-icon">></span>${yearName}`;
        
        const unitContainer = document.createElement('div');
        unitContainer.className = 'sub-group-container open space-y-0.5';
        
        // 단원 렌더링
        Object.entries(yearUnits).forEach(([unitName, unitData], index) => {
            const unitItem = document.createElement('div');
            unitItem.className = 'sub-group-item';
            unitItem.textContent = `${index + 1}. ${unitName}`;
            unitItem.onclick = () => {
                setActiveElement(unitItem);
                displayUnitContent(unitData, unitName, yearName);
            };
            unitContainer.appendChild(unitItem);
        });

        yearHeader.onclick = () => toggleGroup(yearHeader, unitContainer);
        yearContainer.appendChild(yearHeader);
        yearContainer.appendChild(unitContainer);
        curriculumTree.appendChild(yearContainer);
    }

    // 참고 자료 섹션
    addReferenceSection();
}

// 참고 자료 섹션 추가
function addReferenceSection() {
    const refContainer = document.createElement('div');
    refContainer.className = 'mb-3';
    
    const refHeader = document.createElement('div');
    refHeader.className = 'tree-group-item flex items-center text-base font-extrabold text-slate-800';
    refHeader.innerHTML = `<span class="toggle-icon open-icon">></span>참고 자료`;
    
    const refSubContainer = document.createElement('div');
    refSubContainer.className = 'sub-group-container open space-y-1';
    
    // 참고 자료 링크들
    if (curriculumData.references) {
        curriculumData.references.forEach(ref => {
            const wrapper = createRefRow(ref.name, ref.url, ref.downloadName, ref.icon, ref.page);
            refSubContainer.appendChild(wrapper);
        });
    }
    
    refHeader.onclick = () => toggleGroup(refHeader, refSubContainer);
    refContainer.appendChild(refHeader);
    refContainer.appendChild(refSubContainer);
    curriculumTree.appendChild(refContainer);
}

// 참고 자료 행 생성
function createRefRow(text, viewHref, downloadFileName, icon, pageNumber = null) {
    const wrapper = document.createElement('div');
    wrapper.className = 'reference-link-wrapper';
    
    const contentContainer = document.createElement('div');
    const isEdunet = text.includes('에듀넷');
    
    contentContainer.className = `reference-link-item flex-1 ${isEdunet ? 'edunet-link' : 'text-slate-700'} hover:text-blue-600`;
    contentContainer.style.cursor = 'pointer';
    
    if (isEdunet) {
        contentContainer.innerHTML = `<span style="font-weight: 700;">${text}</span><span class="ml-2 text-slate-500">🔗</span>`;
    } else {
        contentContainer.innerHTML = `<span class="mr-2 text-slate-500">${icon}</span><span style="font-weight: 700;">${text}</span>`;
    }
    
    if (pageNumber) {
        contentContainer.onclick = () => openModal(text, viewHref, pageNumber);
    } else {
        contentContainer.onclick = () => window.open(viewHref, '_blank');
    }
    
    wrapper.appendChild(contentContainer);

    if (downloadFileName) {
        const downloadButton = document.createElement('a');
        downloadButton.href = viewHref;
        downloadButton.download = downloadFileName;
        downloadButton.className = 'download-button';
        downloadButton.textContent = '다운로드';
        wrapper.appendChild(downloadButton);
    } else {
        const spacer = document.createElement('span');
        spacer.style.width = '70px';
        wrapper.appendChild(spacer);
    }

    return wrapper;
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

// 활성 요소 설정
function setActiveElement(newActiveElement) {
    if (activeElement) {
        activeElement.classList.remove('active-item');
    }
    newActiveElement.classList.add('active-item');
    activeElement = newActiveElement;
}

// 단원 내용 표시
function displayUnitContent(data, unitName, yearName) {
    placeholderMessage.classList.add('hidden');
    achieveContent.classList.add('hidden');
    loadingSpinner.classList.remove('hidden');
    currentDomainName = data.domain;

    setTimeout(() => {
        loadingSpinner.classList.add('hidden');
        achieveContent.classList.remove('hidden');
        unitTitleContainer.textContent = unitName;
        unitActionsContainer.innerHTML = '';

        // PDF 버튼 추가
        if (data.pdfPages) {
            const achievementButton = document.createElement('button');
            achievementButton.textContent = '수준별 성취수준';
            achievementButton.className = 'unit-actions-button';
            achievementButton.onclick = () => {
                const pdfFile = curriculumData.pdfFile || '성취수준.pdf';
                window.open(`${pdfFile}#page=${data.pdfPages.achievement}`, '_blank');
            };
            unitActionsContainer.appendChild(achievementButton);

            const domainButton = document.createElement('button');
            domainButton.textContent = '영역별 성취수준';
            domainButton.className = 'unit-actions-button';
            domainButton.onclick = () => {
                const pdfFile = curriculumData.pdfFile || '성취수준.pdf';
                window.open(`${pdfFile}#page=${data.pdfPages.domain}`, '_blank');
            };
            unitActionsContainer.appendChild(domainButton);
        }

        // 성취기준 목록
        if (data.achievements && data.achievements.length > 0) {
            achievementList.innerHTML = data.achievements.map(item => `
                <li class="content-list-item">
                    <span class="flex-1">${item}</span>
                </li>
            `).join('');
        } else {
            achievementList.innerHTML = `<li class="content-list-item" style="color: #64748b;">선택하신 단원에 대한 성취기준 데이터가 없습니다.</li>`;
        }

        // 탐구 활동
        if (data.activities && data.activities.length > 0) {
            activitySection.classList.remove('hidden');
            activityList.innerHTML = data.activities.map(item => `
                <li class="activity-list-item-black-bullet">
                    <span>${item}</span>
                </li>
            `).join('');
        } else {
            activitySection.classList.add('hidden');
        }

        // 해설 및 고려사항
        explanationText.innerHTML = formatPdfText(data.explanation);
        considerationText.innerHTML = formatPdfText(data.consideration);

        // 복사 버튼 이벤트 설정
        setupCopyButtons(data);

        document.getElementById('unit-content').scrollTo(0, 0);
    }, 300);
}

// 텍스트 포맷팅
function formatPdfText(text) {
    if (!text) return '';
    
    const cleanedText = text.trim();
    if (cleanedText.length === 0) return '';
    
    const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    let formattedHtml = '';
    
    lines.forEach(line => {
        if (line.length === 0) return;

        const match = line.match(/^(•\s*)?(\[.*?\]\s*)?(.*)$/);
        
        if (match) {
            const code = match[2] ? match[2].trim() : '';
            const content = (match[3] || '').trim();
            const isBulletLine = match[1] || code;

            if (isBulletLine) {
                const codePrefix = code ? `<span class="code">${code}</span>` : '';
                formattedHtml += `
                    <div class="explanation-item">
                        <span class="bullet">•</span>
                        ${codePrefix}
                        <span style="flex-grow: 1;">${content}</span>
                    </div>`;
            } else {
                formattedHtml += `<div class="explanation-item"><span style="flex-grow: 1;">${line}</span></div>`;
            }
        }
    });

    return formattedHtml;
}

// 복사 버튼 설정
function setupCopyButtons(data) {
    const copyAchievementBtn = document.getElementById('copy-achievement-btn');
    const copyExplanationBtn = document.getElementById('copy-explanation-btn');
    const copyConsiderationBtn = document.getElementById('copy-consideration-btn');

    copyAchievementBtn.onclick = () => {
        let text = '【성취기준】\n';
        text += data.achievements.join('\n');
        if (data.activities && data.activities.length > 0) {
            text += '\n\n【탐구 활동】\n';
            text += data.activities.join('\n');
        }
        copyToClipboard(text, '성취기준이 복사되었습니다');
    };

    copyExplanationBtn.onclick = () => {
        copyToClipboard(stripHtmlTags(data.explanation), '해설이 복사되었습니다');
    };

    copyConsiderationBtn.onclick = () => {
        copyToClipboard(stripHtmlTags(data.consideration), '고려사항이 복사되었습니다');
    };
}

// 클립보드 복사
function copyToClipboard(text, message) {
    navigator.clipboard.writeText(text).then(() => {
        showToast(message);
    }).catch(err => {
        alert('복사 실패: ' + err);
    });
}

// HTML 태그 제거
function stripHtmlTags(html) {
    const temp = document.createElement('div');
    temp.innerHTML = html;
    return temp.textContent || temp.innerText || '';
}

// 토스트 메시지
function showToast(message) {
    const toast = document.createElement('div');
    toast.textContent = message;
    toast.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background-color: #1e293b;
        color: white;
        padding: 12px 24px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        z-index: 10000;
        animation: slideIn 0.3s ease-out;
    `;
    document.body.appendChild(toast);
    setTimeout(() => {
        toast.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => toast.remove(), 300);
    }, 2000);
}

// 모달 열기/닫기
function openModal(title, pdfLink, pageNumber) {
    const modal = document.getElementById('pdf-modal');
    const modalTitle = document.getElementById('modal-title');
    const modalBody = document.getElementById('modal-body');
    
    modalTitle.textContent = title;
    const finalLink = `${pdfLink}#page=${pageNumber}`;

    modalBody.innerHTML = `
        <p class="text-slate-700 mb-4">PDF 파일의 ${pageNumber}페이지로 바로 이동을 시도합니다.<br>브라우저 설정에 따라 새 탭에서 열릴 수 있습니다.</p>
        <a href="${finalLink}" target="_blank" class="px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors inline-block shadow-lg">
            PDF 파일 열기
        </a>
    `;
    modal.classList.remove('hidden');
}

function closeModal() {
    document.getElementById('pdf-modal').classList.add('hidden');
}

// CSS 애니메이션 추가
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(style);