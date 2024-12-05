document.getElementById('loanEligibilityForm').addEventListener('submit', function (e) {
    e.preventDefault();

    const income = Number(document.getElementById('income').value);
    const creditScore = Number(document.getElementById('creditScore').value);
    const age = Number(document.getElementById('age').value);
    const dti = Number(document.getElementById('dti').value); // Debt-to-Income Ratio
    const loanAmount = Number(document.getElementById('loanAmount').value);

    let eligible = true;
    let reasons = [];


    // Check credit score
    if (creditScore < 650) {
        reasons.push("Low credit score.");
        eligible = false;
    }

    // Check age
    if (age < 21 || age > 60) {
        reasons.push("Age must be between 21 and 60.");
        eligible = false;
    }

    // Check Debt-to-Income ratio
    if (dti > 40) {
        reasons.push("Debt-to-Income ratio exceeds 40%.");
        eligible = false;
    }

    const grossMonthlyIncome = income / 12;
    const dtiRatio = (dti / grossMonthlyIncome) * 100;
    if (dtiRatio > 40) {
        reasons.push("Debt-to-Income ratio exceeds 40%.");
        eligible = false;
    }

    // Check Loan-to-Income ratio
    const ltiRatio = loanAmount / income;
    if (ltiRatio > 5) {
        reasons.push("Requested loan exceeds maximum allowed based on income.");
        eligible = false;
    }

    const resultDiv = document.getElementById('result');
    if (eligible) {
        resultDiv.textContent = "Congratulations! You are eligible for the loan.";
        resultDiv.className = "text-green-600";
    } else {
        resultDiv.textContent = `Unfortunately, you are not eligible for the loan. Reasons: ${reasons.join(' ')}`;
        resultDiv.className = "text-red-600";
    }
});