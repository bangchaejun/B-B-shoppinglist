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
        alert("유효한 예산을 입력하세요!");
    }
}

function setPresetBudget(amount) {
    budget = amount;
    document.getElementById("budgetInput").value = budget.toLocaleString('ko-KR');
    document.getElementById("budgetStatus").textContent = "예산: ₩" + budget.toLocaleString('en-US');
    updateBalance();
    saveShoppingList();
}

function addItem() {
    var itemNameInput = document.getElementById("itemNameInput");
    var itemName = itemNameInput.value.trim();

    if (itemName !== "") {
        var itemList = document.getElementById("itemList");
        var li = document.createElement("li");

        var itemText = document.createElement("span");
        itemText.textContent = itemName;
        itemText.className = "itemText";

        var deleteButton = document.createElement("button");
        deleteButton.innerHTML = '<i class="fas fa-trash-alt"></i> 삭제';
        deleteButton.className = "deleteButton";
        deleteButton.onclick = function() {
            var deleteConfirmation = prompt("'" + itemName + "'의 가격을 입력하세요.");
            if (deleteConfirmation !== null) {
                var deletePrice = parseFloat(deleteConfirmation.trim().replace(/,/g, ''));
                if (!isNaN(deletePrice) && deletePrice > 0) {
                    deleteItem(li, itemName, deletePrice);
                } else {
                    alert("유효한 가격을 입력하세요!");
                }
            }
        };

        var checkbox = document.createElement("input");
        checkbox.type = "checkbox";

        li.appendChild(checkbox);
        li.appendChild(itemText);
        li.appendChild(deleteButton);
        itemList.appendChild(li);
        itemNameInput.value = "";
        saveShoppingList();
        updateBalance();
    } else {
        alert("유효한 항목을 입력하세요!");
    }
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
                        alert("유효한 가격을 입력하세요!");
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
