let budget = 0;
let totalSpent = 0;
let currentDate = new Date().toISOString().split('T')[0]; // YYYY-MM-DD 형식의 날짜

document.addEventListener('DOMContentLoaded', function() {
    var budgetDateInput = document.getElementById("budgetDateInput");
    budgetDateInput.value = currentDate; // 오늘 날짜로 초기화

    loadShoppingList();
    loadHistory();
});

function updateBalance() {
    const balance = budget - totalSpent;
    document.getElementById("balanceStatus").textContent = "잔액: ₩" + balance.toLocaleString('en-US');
}

function setBudget() {
    var budgetInput = document.getElementById("budgetInput");
    var budgetDateInput = document.getElementById("budgetDateInput");
    currentDate = budgetDateInput.value;

    var budgetValue = parseFloat(budgetInput.value.trim().replace(/,/g, ''));
    
    if (!isNaN(budgetValue) && budgetValue > 0) {
        budget = budgetValue;
        document.getElementById("budgetStatus").textContent = "예산: ₩" + budget.toLocaleString('en-US');
        updateBalance();
        saveShoppingList();
    } else {
        alert('유효한 예산을 입력하세요!');
    }
}

function setPresetBudget(amount) {
    budget = amount;
    document.getElementById("budgetInput").value = budget.toLocaleString('ko-KR');
    document.getElementById("budgetStatus").textContent = "예산: ₩" + budget.toLocaleString('en-US');
    updateBalance();
    saveShoppingList();
    hideDropdown();
}

function addItem() {
    var itemNameInput = document.getElementById("itemNameInput");
    var itemName = itemNameInput.value.trim();

    if (itemName !== "") {
        // 기존 항목 중복 확인
        var itemList = document.getElementById("itemList");
        var items = itemList.getElementsByTagName("li");
        for (var i = 0; i < items.length; i++) {
            if (items[i].getElementsByClassName("itemText")[0].textContent === itemName) {
                alert('목록에 들어있는 품목입니다.');
                return;
            }
        }

        var li = document.createElement("li");

        var itemText = document.createElement("span");
        itemText.textContent = itemName;
        itemText.className = "itemText";

        var purchaseButton = document.createElement("button");
        purchaseButton.innerHTML = '<i class="fas fa-shopping-cart"></i> 구매';
        purchaseButton.className = "purchaseButton";
        purchaseButton.onclick = function() {
            var purchaseConfirmation = prompt("'" + itemName + "'의 가격을 입력하세요.");
            if (purchaseConfirmation !== null) {
                var purchasePrice = parseFloat(purchaseConfirmation.trim().replace(/,/g, ''));
                if (!isNaN(purchasePrice) && purchasePrice > 0) {
                    purchaseItem(li, itemName, purchasePrice);
                } else {
                    alert('유효한 가격을 입력하세요!');
                }
            }
        };

        var checkbox = document.createElement("input");
        checkbox.type = "checkbox";

        li.appendChild(checkbox);
        li.appendChild(itemText);
        li.appendChild(purchaseButton);
        itemList.appendChild(li);
        itemNameInput.value = "";
        saveShoppingList();
        updateBalance();
    } else {
        alert('유효한 항목을 입력하세요!');
    }
}

function purchaseItem(item, itemName, price) {
    item.parentNode.removeChild(item);
    totalSpent += price;
    updateTotal();
    saveDeletedItem(itemName, price);
    saveShoppingList();
    updateBalance();
}

function deleteItem(item, itemName, price) {
    item.parentNode.removeChild(item);
    totalSpent += price;
    updateTotal();
    saveDeletedItem(itemName, price);
    saveShoppingList();
    updateBalance();
}

function saveDeletedItem(itemName, price) {
    let historyData = JSON.parse(localStorage.getItem('historyData')) || {};
    if (!historyData[currentDate]) {
        historyData[currentDate] = [];
    }
    historyData[currentDate].push({ itemName, price });
    localStorage.setItem('historyData', JSON.stringify(historyData));
    loadHistory();
}

function updateTotal() {
    var totalAmountDiv = document.getElementById("totalAmount");
    totalAmountDiv.textContent = "오늘 구매한 총 금액: ₩" + totalSpent.toLocaleString('en-US');
}

function resetValues() {
    budget = 0;
    totalSpent = 0;
    document.getElementById("budgetInput").value = '';
    document.getElementById("budgetStatus").textContent = "예산: 설정되지 않음";
    document.getElementById("totalAmount").textContent = "오늘 구매한 총 금액: ₩0";
    document.getElementById("balanceStatus").textContent = "잔액: ₩0";
    localStorage.removeItem('historyData');
    localStorage.removeItem(currentDate);
    document.getElementById("itemList").innerHTML = '';
    document.getElementById("historyList").innerHTML = '';
}

function loadShoppingList() {
    const savedData = JSON.parse(localStorage.getItem(currentDate));
    if (savedData) {
        budget = savedData.budget;
        totalSpent = savedData.totalSpent;
        document.getElementById("budgetStatus").textContent = "예산: ₩" + budget.toLocaleString('en-US');
        document.getElementById("totalAmount").textContent = "오늘 구매한 총 금액: ₩" + totalSpent.toLocaleString('en-US');
        const itemList = document.getElementById("itemList");
        itemList.innerHTML = '';
        savedData.items.forEach(itemText => {
            const li = document.createElement("li");
            const itemSpan = document.createElement("span");
            itemSpan.textContent = itemText;
            itemSpan.className = "itemText";
            const deleteButton = document.createElement("button");
            deleteButton.innerHTML = '<i class="fas fa-trash-alt"></i> 삭제';
            deleteButton.className = "deleteButton";
            deleteButton.onclick = function() {
                var deleteConfirmation = prompt("'" + itemText + "'의 가격을 입력하세요.");
                if (deleteConfirmation !== null) {
                    var deletePrice = parseFloat(deleteConfirmation.trim().replace(/,/g, ''));
                    if (!isNaN(deletePrice) && deletePrice > 0) {
                        deleteItem(li, itemText, deletePrice);
                    } else {
                        alert('유효한 가격을 입력하세요!');
                    }
                }
            };

            const checkbox = document.createElement("input");
            checkbox.type = "checkbox";

            li.appendChild(checkbox);
            li.appendChild(itemSpan);
            li.appendChild(deleteButton);
            itemList.appendChild(li);
        });
        updateBalance();
    }
}

function loadHistory() {
    const historyList = document.getElementById("historyList");
    historyList.innerHTML = '';
    const historyData = JSON.parse(localStorage.getItem('historyData')) || {};
    for (const date in historyData) {
        const dateItem = document.createElement("li");
        const dateText = document.createElement("span");
        dateText.textContent = date;
        dateItem.appendChild(dateText);

        const ul = document.createElement("ul");
        historyData[date].forEach((entry, index) => {
            const li = document.createElement("li");
            const checkbox = document.createElement("input");
            checkbox.type = "checkbox";
            checkbox.dataset.date = date;
            checkbox.dataset.index = index;

            li.appendChild(checkbox);
            li.appendChild(document.createTextNode(`${entry.itemName} - ₩${entry.price.toLocaleString('en-US')}`));
            ul.appendChild(li);
        });
        dateItem.appendChild(ul);
        historyList.appendChild(dateItem);
    }
}

function removeSelectedItemsFromList() {
    const checkboxes = document.querySelectorAll('#itemList input[type="checkbox"]:checked');
    checkboxes.forEach(checkbox => {
        const li = checkbox.parentElement;
        li.parentNode.removeChild(li);
    });
    saveShoppingList();
    updateBalance();
}

function deleteSelectedItems() {
    const checkboxes = document.querySelectorAll('#historyList input[type="checkbox"]:checked');
    let historyData = JSON.parse(localStorage.getItem('historyData')) || {};

    checkboxes.forEach(checkbox => {
        const date = checkbox.dataset.date;
        const index = checkbox.dataset.index;
        if (historyData[date]) {
            historyData[date].splice(index, 1);
            if (historyData[date].length === 0) {
                delete historyData[date];
            }
        }
    });

    localStorage.setItem('historyData', JSON.stringify(historyData));
    loadHistory();
}

function formatCurrency(input) {
    let value = input.value.replace(/[^0-9]/g, '');
    if (value === '') return;

    value = parseInt(value, 10).toLocaleString('ko-KR');

    input.value = value;
}

function saveShoppingList() {
    const items = [];
    document.querySelectorAll('#itemList li').forEach(li => {
        items.push(li.querySelector('span').textContent);
    });
    const shoppingData = {
        budget,
        totalSpent,
        items
    };
    localStorage.setItem(currentDate, JSON.stringify(shoppingData));
    loadHistory();
}

function showDropdown() {
    document.getElementById("dropdownMenu").classList.add("show");
}

function hideDropdown() {
    setTimeout(() => {
        document.getElementById("dropdownMenu").classList.remove("show");
    }, 200); // 블러 이벤트가 발생한 후 일정 시간 동안 대기한 후 드롭다운 메뉴를 숨깁니다.
}

function shareHistory() {
    const historyData = JSON.parse(localStorage.getItem('historyData')) || {};
    let textToShare = "Shopping History:\n";
    let totalAmount = 0;
    for (const date in historyData) {
        textToShare += `${date}:\n`;
        historyData[date].forEach(entry => {
            textToShare += `- ${entry.itemName}: ₩${entry.price.toLocaleString('en-US')}\n`;
            totalAmount += entry.price;
        });
    }
    textToShare += `\nTotal Amount: ₩${totalAmount.toLocaleString('en-US')}`;
    copyToClipboard(textToShare);
    alert('쇼핑 히스토리가 클립보드에 복사되었습니다.');
}

function copyToClipboard(text) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand('copy');
    document.body.removeChild(textArea);
}
