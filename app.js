// BUDGET CONTROLLER
var budgetController = (function(){
    var Expense = function(id,description,value){
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    };
    Expense.prototype.calcPercentage = function(totalIncome){
        if(totalIncome > 0){
            this.percentage = Math.round((this.value / totalIncome) * 100);
        }else{
            this.percentage = -1
        }
    };
    Expense.prototype.getPercentage = function(){
        return this.percentage;
    }

    var Income = function(id,description,value){
        this.id = id;
        this.description = description;
        this.value = value;
    };

    var calculateTotal = function(type){
        var sum = 0;
        data.allItems[type].forEach(function(cur){
            sum += cur.value;
        });
        data.totals[type] = sum;

    }
    var data = {
        allItems: {
            exp: [],
            inc: []
        },
        totals: {
            exp: 0,
            inc: 0
        },
        budget: 0,
        percentage: -1
    }; 


        return {
            addItem: function(type,desig,val){
                var newItem, ID;
                //[1 2 3 4],next ID=6
                //ID = last ID + 1

                //Create new ID
                if (data.allItems[type].length > 0){

                    ID = data.allItems[type][data.allItems[type].length -1].id +1;
                }else{
                    ID = 0;
                }

                if(type === 'exp'){
                    newItem = new Expense(ID, desig, val);
                }else if(type === 'inc'){
                    newItem = new Income(ID, desig, val);
                }
                // PUSH IT INTO DATA STRUCTURE
                data.allItems[type].push(newItem);

                // RETURN THE NEW ELEMENT
                return newItem;
            },

            deleteItem: function(type, id){
                var index, ids;

                // id = 6
                // ids = [1 2 4 6 8] 
                // index = 3
                ids = data.allItems[type].map(function(current){
                    return current.id;
                });

                index = ids.indexOf(id);

                if(index !== -1){
                    data.allItems[type].splice(index, 1);
                }
                
            },

            calculateBudget: function(){
                // CALCULATE THE TOTAL INCOME AND EXPENSE
                calculateTotal('exp');
                calculateTotal('inc');

                // CALCULATE BUDGET: INCOME - EXPENSE
                data.budget = data.totals.inc - data.totals.exp;

                //CALCULATE THE PERCENTAGE
                data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
            },

            calculatePercentage: function(){

                data.allItems.exp.forEach(function(current){
                    current.calcPercentage(data.totals.inc);
                });
            },

            getPercentage: function(){
                var allPercentages = data.allItems.exp.map(function(current){
                    return current.getPercentage();
                })
                return allPercentages; 
            },

            getBudget: function(){
                return {
                    budget: data.budget,
                    totalInc: data.totals.inc,
                    totalExp: data.totals.exp,
                    percentage: data.percentage
                };
            },

            testing: function(){
                console.log(data);
            }
        }

    
    
})();


// UI CONTROLLER
var UIcontroller = function(){
    var DOMstrings = {
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        inputBtn: '.add__btn',
        incomeContainer: '.income__list',
        expencesContainer: '.expenses__list',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expenseLabel: '.budget__expenses--value',
        percentageLabel: '.budget__expenses--percentage',
        container: '.container',
        expensePercLabel: '.item__percentage',
        dateLabel: '.budget__title--month'
    };

    var formatNumber =  function(num, type){
        var numSplit, int, dec;
        /*
        1.  + OR - BEFORE POINTS
        2.  COMMA(",") SEPERATING THE THOUSANDS
        */
       num = Math.abs(num);
       num = num.toFixed(2);

       numSplit = num.split('.');
       int = numSplit[0];
        if(int.length > 3){
            int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3,int.length);
        }

       dec = numSplit[1];

       return (type === 'exp' ? '-' : '+') + ' ' + int + '.' +dec;

    };

    var nodeListforEach = function(list, callback){
        for (var i =0 ; i < list.length; i++){
            callback(list[i], i);
        }
    };

    return {
        getInput: function(){
            return {
                type: document.querySelector(DOMstrings.inputType).value,
                description: document.querySelector(DOMstrings.inputDescription).value,
                value: parseFloat(document.querySelector(DOMstrings.inputValue).value)
            };
        },
        addListItem: function(obj,type){
            var html, newHtml,element;
            // Create HTML string with placeholder text
            if (type === 'inc'){
                element = DOMstrings.incomeContainer;
                html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
            } else if (type === 'exp'){
                element = DOMstrings.expencesContainer;
                html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
            }
            // Replace the placeholder text with some actual data
            newHtml = html.replace('%id%',obj.id);
            newHtml = newHtml.replace('%description%',obj.description);
            newHtml = newHtml.replace('%value%',formatNumber(obj.value, type));
            // Insert into HTML
            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
        },

        deleteListItem: function(selectorID){
            var el = document.getElementById(selectorID);
            el.parentNode.removeChild(el);
        },

        clearFields: function(){
            var fields, fieldArr;

            fields = document.querySelectorAll(DOMstrings.inputDescription +', '+DOMstrings.inputValue);

            fieldArr = Array.prototype.slice.call(fields);

            fieldArr.forEach(function(current, index, array){
                current.value = "";
            })
            
            fieldArr[0].focus();

        
        },
        displayBudget: function(obj){
            var type;
            obj.budget > 0 ? type = 'inc' : type = 'exp';
            document.querySelector(DOMstrings.budgetLabel).textContent =formatNumber(obj.budget, type);
            document.querySelector(DOMstrings.incomeLabel).textContent =formatNumber(obj.totalInc,'inc');
            document.querySelector(DOMstrings.expenseLabel).textContent =formatNumber(obj.totalExp,'exp');
            
            if(obj.percentage > 0){
                document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage + '%';
            }else{
                document.querySelector(DOMstrings.percentageLabel).textContent = '--';
            }
        },

        displayPercentage: function(percentages){
            var fields = document.querySelectorAll(DOMstrings.expensePercLabel);

            

            nodeListforEach(fields, function(current, index){

                if (percentages[index]>0){
                    current.textContent = percentages[index] + '%'
                }else{
                    current.textContent = '---';
                }
            })
        },

        displayDate: function(){
            var now,months,month, year;

            now = new Date();
            months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'Octomber', 'November', 'December']
            month = now.getMonth();
            year = now.getFullYear();
            document.querySelector(DOMstrings.dateLabel).textContent = months[month] + ' ' + year;
        },

        changedType: function(){
            var fields = document.querySelectorAll(
                DOMstrings.inputType +','+
                DOMstrings.inputDescription +','+
                DOMstrings.inputValue);

            nodeListforEach(fields, function(current){
                current.classList.toggle('red-focus');
            });
            document.querySelector(DOMstrings.inputBtn).classList.toggle('red')

            
        },

        getDOMstrings: function(){
            return DOMstrings;
        }
    };

}();

// GLOBAL APP CONTROLLER

var controller = (function(budgetctrl,uictrl){
    var setupEventListners = function(){
        var DOM = uictrl.getDOMstrings();
        document.querySelector(DOM.inputBtn).addEventListener('click', ctrlADDitem);
        document.addEventListener('keypress',function(event){

            if (event.keyCode === 13 || event.which === 13){

                ctrlADDitem();
            }
        });
        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);
        document.querySelector(DOM.inputType).addEventListener('change', uictrl.changedType);
    };

    var updateBudget = function(){
        // 1.CALCULATE THE BUDGET
        budgetctrl.calculateBudget();

        // 2.RETURN THE BUDGET
        var budget = budgetctrl.getBudget();

        // 3.DISPLAY THE BUDGET ON UI
        uictrl.displayBudget(budget);

    };

    var updatePercentage = function(){

        // 1. CALCULATE THE PERCENTAGE
        budgetctrl.calculatePercentage()

        // 2. READ THE PERCENTAGE FROM THE BUDGET CONTROLLER
        var percentages = budgetctrl.getPercentage();

        // 3. DISPLAY PERCENTAGE ON THE UI
        uictrl.displayPercentage(percentages);
    }

    
    var ctrlADDitem = function(){
        // 1. GET THE FIELD INPUT DATA
        var input = uictrl.getInput();
        if(input.description !== "" && !isNaN(input.value) && input.value>0){

            // 2. ADD THE ITEM TO THE BUDGET CONTROLLER
            newItem = budgetctrl.addItem(input.type, input.description, input.value);
    
            // 3. ADD THE ITEM TO THE UI
            uictrl.addListItem(newItem, input.type);
    
            // 4. CLEAR THE FIELDS BEFORE NEW ENTRY
            uictrl.clearFields();

            // 5. CALCULATE AND UPDATE BUDGET
            updateBudget();

            // 6. CALCULATE AND UPDATE THE PERCENTAGE
            updatePercentage();

        }
    };
    var ctrlDeleteItem = function(event){
        var itemID, splitId, type, ID;
        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;

        if(itemID){

            splitId = itemID.split('-');
            type = splitId[0]
            ID = parseInt(splitId[1]);

            // 1. DELETE THE ITEM FROM THE DATA STRUCTURE
            budgetctrl.deleteItem(type , ID);

            // 2. DELETE THE ITEM FROM THE UI
            uictrl.deleteListItem(itemID)

            // 3. UPDATE AND SHOW THE BUDGET
            updateBudget();

            //6. CALCULATE AND UPDATE THE PERCENTAGE
            updatePercentage();
 
        }

    };
    return {
        init: function(){
            console.log('Application has started.')
            uictrl.displayDate();
            uictrl.displayBudget({
                budget: 0,
                totalInc: 0,
                totalExp: 0,
                percentage: -1
            });
            setupEventListners();
        }
    };
  

})(budgetController,UIcontroller);
controller.init();