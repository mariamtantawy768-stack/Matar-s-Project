// ================= FUNCTION =================
function f(x, eq) {
  try {
    return Function("x", "return " + eq)(x);
  } catch {
    return NaN;
  }
}

function derivative(x, eq) {
  let h = 0.0001;
  return (f(x + h, eq) - f(x, eq)) / h;
}

let currentMethod = "bisection";
let chart;

// ================= DROPDOWN =================
document.getElementById("selected").onclick = () => {
  let o = document.querySelector(".options");
  o.style.display = o.style.display === "block" ? "none" : "block";
};

document.addEventListener("click", (e) => {
  if (!e.target.closest(".dropdown")) {
    document.querySelector(".options").style.display = "none";
  }
});

// ================= GRAPH =================
function drawGraph(eq) {
  let x = [], y = [];

  for (let i = -10; i <= 10; i += 0.5) {
    x.push(i);
    let val = f(i, eq);
    y.push(isNaN(val) ? null : val);
  }

  if (chart) chart.destroy();

  chart = new Chart(document.getElementById("chart"), {
    type: "line",
    data: {
      labels: x,
      datasets: [{
        label: "f(x)",
        data: y,
        borderWidth: 2,
        tension: 0.4,
        pointRadius: 0
      }]
    }
  });
}

// ================= METHODS =================

// Bisection
function bisection(eq, xl, xu, eps) {
  let data = [], xr = 0, i = 0;

  while (i < 50) {
    let xr_old = xr;
    xr = (xl + xu) / 2;

    let fx_l = f(xl, eq);
    let fx_u = f(xu, eq);
    let fx_r = f(xr, eq);

    let error = xr !== 0 ? Math.abs((xr - xr_old) / xr) * 100 : 0;

    data.push({ i, xl, fx_l, xu, fx_u, xr, fx_r, error });

    if (fx_l * fx_r > 0) xl = xr;
    else xu = xr;

    if (error <= eps) break;
    i++;
  }

  return { root: xr, data };
}

// False Position
function falsePosition(eq, xl, xu, eps) {
  let data = [], xr = 0, i = 0;

  while (i < 50) {
    let xr_old = xr;

    let fx_l = f(xl, eq);
    let fx_u = f(xu, eq);

    xr = xu - (fx_u * (xl - xu)) / (fx_l - fx_u);

    let fx_r = f(xr, eq);
    let error = Math.abs((xr - xr_old) / xr) * 100;

    data.push({ i, xl, fx_l, xu, fx_u, xr, fx_r, error });

    if (fx_l * fx_r > 0) xl = xr;
    else xu = xr;

    if (error <= eps) break;
    i++;
  }

  return { root: xr, data };
}

// Newton
function newton(eq, x0, eps) {
  let data = [], i = 0;

  while (i < 50) {
    let fx = f(x0, eq);
    let d = derivative(x0, eq);

    if (d === 0) break;

    let x1 = x0 - (fx / d);
    let error = Math.abs((x1 - x0) / x1) * 100;

    data.push({ i, x0, fx, d, x1, error });

    if (error <= eps) break;

    x0 = x1;
    i++;
  }

  return { root: x0, data };
}

// Fixed Point
function fixed(eq, x0, eps) {
  let data = [], i = 0;

  while (i < 50) {
    let x1 = f(x0, eq);
    let error = Math.abs((x1 - x0) / x1) * 100;

    data.push({ i, x0, x1, error });

    if (error <= eps) break;

    x0 = x1;
    i++;
  }

  return { root: x0, data };
}

// Secant
function secant(eq, x0, x1, eps) {
  let data = [], i = 0;

  while (i < 50) {
    let fx0 = f(x0, eq);
    let fx1 = f(x1, eq);

    let x2 = x1 - (fx1 * (x0 - x1)) / (fx0 - fx1);
    let error = Math.abs((x2 - x1) / x2) * 100;

    data.push({ i, x0, x1, x2, error });

    if (error <= eps) break;

    x0 = x1;
    x1 = x2;
    i++;
  }

  return { root: x1, data };
}

// ================= SOLVE =================
function solve() {

  let eq = document.getElementById("equation").value;
  let xl = parseFloat(document.getElementById("xl").value);
  let xu = parseFloat(document.getElementById("xu").value);
  let guess = parseFloat(document.getElementById("guess").value);
  let eps = parseFloat(document.getElementById("eps").value);

  if (!eq) {
    alert("Enter equation!");
    return;
  }

  document.getElementById("root").innerText = "Calculating...";

  let result;

  if (currentMethod === "bisection")
    result = bisection(eq, xl, xu, eps);

  else if (currentMethod === "false")
    result = falsePosition(eq, xl, xu, eps);

  else if (currentMethod === "newton")
    result = newton(eq, guess, eps);

  else if (currentMethod === "fixed")
    result = fixed(eq, guess, eps);

  else if (currentMethod === "secant")
    result = secant(eq, xl, guess, eps);

  document.getElementById("root").innerText = result.root.toFixed(4);

  drawGraph(eq);

  // ===== TABLE =====
  let thead = document.querySelector("#table thead");
  let tbody = document.querySelector("#table tbody");

  thead.innerHTML = "";
  tbody.innerHTML = "";

  if (currentMethod === "bisection" || currentMethod === "false") {
    thead.innerHTML = `
    <tr>
    <th>Iter</th>
    <th>xl</th><th>f(xl)</th>
    <th>xu</th><th>f(xu)</th>
    <th>xr</th><th>f(xr)</th>
    <th>Error</th>
    </tr>`;

    result.data.forEach(r => {
      tbody.innerHTML += `
      <tr>
        <td>${r.i}</td>
        <td>${r.xl.toFixed(3)}</td>
        <td>${r.fx_l.toFixed(3)}</td>
        <td>${r.xu.toFixed(3)}</td>
        <td>${r.fx_u.toFixed(3)}</td>
        <td>${r.xr.toFixed(3)}</td>
        <td>${r.fx_r.toFixed(3)}</td>
        <td>${r.error.toFixed(3)}</td>
      </tr>`;
    });
  }

  else if (currentMethod === "newton") {
    thead.innerHTML = `
    <tr>
    <th>Iter</th><th>x0</th><th>f(x)</th>
    <th>f'(x)</th><th>x1</th><th>Error</th>
    </tr>`;

    result.data.forEach(r => {
      tbody.innerHTML += `
      <tr>
        <td>${r.i}</td>
        <td>${r.x0.toFixed(3)}</td>
        <td>${r.fx.toFixed(3)}</td>
        <td>${r.d.toFixed(3)}</td>
        <td>${r.x1.toFixed(3)}</td>
        <td>${r.error.toFixed(3)}</td>
      </tr>`;
    });
  }

  else if (currentMethod === "fixed") {
    thead.innerHTML = `
    <tr>
    <th>Iter</th><th>x0</th><th>x1</th><th>Error</th>
    </tr>`;

    result.data.forEach(r => {
      tbody.innerHTML += `
      <tr>
        <td>${r.i}</td>
        <td>${r.x0.toFixed(3)}</td>
        <td>${r.x1.toFixed(3)}</td>
        <td>${r.error.toFixed(3)}</td>
      </tr>`;
    });
  }

  else if (currentMethod === "secant") {
    thead.innerHTML = `
    <tr>
    <th>Iter</th><th>x0</th><th>x1</th>
    <th>x2</th><th>Error</th>
    </tr>`;

    result.data.forEach(r => {
      tbody.innerHTML += `
      <tr>
        <td>${r.i}</td>
        <td>${r.x0.toFixed(3)}</td>
        <td>${r.x1.toFixed(3)}</td>
        <td>${r.x2.toFixed(3)}</td>
        <td>${r.error.toFixed(3)}</td>
      </tr>`;
    });
  }
}

// ================= SELECT =================
function selectMethod(m) {
  currentMethod = m;
  document.getElementById("selected").innerText = m;
}

// default
selectMethod("bisection");

// splash
document.getElementById("splash").onclick = () => {
  document.getElementById("splash").classList.add("hide");
};