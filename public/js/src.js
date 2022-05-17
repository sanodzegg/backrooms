fetch("/v/all")
  .then((res) => res.json())
  .then((data) => {
    console.log(data);
    data.forEach((e) => {
      let node = document.createElement("h3");
      node.innerText = `${e.ID} / ${e.Name} / ${e.Description} / ${e.Price} / ${e.Stock}`;
      document.getElementById("all").appendChild(node);
    });
  });
fetch("/v/stock")
  .then((res) => res.json())
  .then((data) => {
    data.forEach((e) => {
      let node = document.createElement("h3");
      node.innerText = `${e.ID} / ${e.Name} / ${e.Description} / ${e.Price}`;
      document.getElementById("stock").appendChild(node);
    });
  });
fetch("/v/3")
  .then((res) => res.json())
  .then((data) => {
    data.forEach((e) => {
      let node = document.createElement("h3");
      node.innerText = `${e.ID} / ${e.Name} / ${e.Description} / ${e.Price} / ${e.Stock}`;
      document.getElementById("single").appendChild(node);
    });
  });
