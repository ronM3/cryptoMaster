(function () {
  let coinsArray = [];
  let coinIdToMoreInfoMap = new Map();
  let saveCoinsForReport = new Set();
  let tempChartCoinArray = [];
  let counterButton = 0;
  let scrollBarArrayInfo = []

  $(function () {
    getCoinsFromApi();

    function getCoinsFromApi() {
      $.get("https://api.coingecko.com/api/v3/coins/")
        .then(function (coins) {
          for (let index = 0; index < 50; index++) {
            initCoinsModel(coins[index], coinsArray);
          }
          for (let index = 0; index < coinsArray.length; index++) {
            addCardtoUi($("#coinsContainer"), coinsArray[index]);
          }
        })
        .catch(() => console.log("Failed"));
    }
    function initCoinsModel(object, array) {
      let name = object.name;
      let symbol = object.symbol;
      let image = object.image;
      let id = object.id;
      let priceChange = object.market_data;
      let coin = {
        name,
        symbol,
        image,
        id,
        priceChange
      };
      array.push(coin);
    }
    function showCoinsCard() {
      for (let index = 0; index < coinsArray.length; index++) {
        addCardtoUi($("#coinsContainer"), coinsArray[index]);
      }
    }
    function addCardtoUi(container, object) {
      let card = $(
        `<div class="card" id="${object.id}-card" style="width: 17.8rem;">
           <div class="card-body">
           <img src="${object.image.thumb}" class="coin_image">
           <span class="card_title">${object.name}</span>
           <span class="coin_Symbul">${object.symbol}</span>
          
           </div>

         </div>`
      );
      let price_changes = $(`<span class="price_change">24hr<br></span><span class="percentage">${object.priceChange.price_change_percentage_24h+"%"}</span>`)
      $(card).append(price_changes);


      let toggleContainer = $(`<div class="form-check form-switch"></div`);
      $(card).append(toggleContainer);

      let toggleInput = $(`<input class="form-check-input" id="${object.symbol}" type="checkbox"/>`);
      $(toggleContainer).append(toggleInput);

      $(toggleInput).on("click", function onClickGetSymbol() {
        toggleCoin($(this).prop("checked"), object.symbol, object.id);
      });

      let moreInfoButton = $(
        `<button class="details_button btn btn-primary" id="${object.id}">More Info >></button>"`
      );

      let progressBar = $(`<div class="progress-bar stripes animated reverse slower" id="progress-bar-${object.id}">
      <span class="progress-bar-inner"></span>
       </div>`);

      $(card).append(progressBar);
      $(container).append(card);
      $(card).append(moreInfoButton);
    }

    $(document).on("click", ".details_button", function getCoinsData() {
      let currentCoinId = onButtonClicked($(this));
      closeInfo(currentCoinId);
  
      function closeInfo(currentCoinId) {
          $(`#${currentCoinId}`).html("X").css({ marginLeft: "165px", position: "absolute", "padding":"0px 4px" });
      }
      if (!$(`#${currentCoinId}-moreInfo`).find(".box_size").length) {
        $(`#${currentCoinId}`).hide();
        $(`#progress-bar-${currentCoinId}`).css("display", "block");
      }
      $(function getCoinsMoreInfo() {
        $.get("https://api.coingecko.com/api/v3/coins/" + currentCoinId)
          .then(function (coinsData) {
            $(`#progress-bar-${currentCoinId}`).css("display", "none");
            saveCoinsToMap(currentCoinId, initCoinsMoreInfo(coinsData));
            if (!$(`#${currentCoinId}-moreInfo`).find(".box_size").length) {
              addDataToCard(coinsData);
              $(`#${currentCoinId}`).show();
            } else {
                $(`#${currentCoinId}`).hide();
   
              $(`#${currentCoinId}-moreInfo`).remove();
              $(`#${currentCoinId}`).html("More info >>").css({ marginLeft: "20px", padding: ".375rem .75rem"});
              $(`#${currentCoinId}`).show();
            }
      
          })
          .catch(() => console.log("Failed"));
  
        function addDataToCard(coinsData) {
          let coinInfo = `<div class="box_size" id="${currentCoinId}-moreInfo">
          <div class="box_size">
            <h5 class="moreInfo_heading">Market Currencies</h5>
              <b>$</b> ${coinsData.market_data.current_price.usd}<br>
              <b>€</b> ${coinsData.market_data.current_price.eur}<br>
              <b>₪</b> ${coinsData.market_data.current_price.ils}
              </div>
          </div>`;
          $(`#${currentCoinId}-card`).append(coinInfo);
        }
      });
  
      function initCoinsMoreInfo(coinsData) {
        let currentCoinValueUsd = coinsData.market_data.current_price.usd;
        let currentCoinValueEur = coinsData.market_data.current_price.eur;
        let currentCoinValueIls = coinsData.market_data.current_price.ils;
  
        let moreInfoCoinObj = {
          currentCoinValueUsd,
          currentCoinValueEur,
          currentCoinValueIls,
        };
        return moreInfoCoinObj;
      }
      function saveCoinsToMap(currentCoinId, moreInfoCoinObj) {
        coinIdToMoreInfoMap.set(currentCoinId, moreInfoCoinObj);
        setTimeout(() => {
          coinIdToMoreInfoMap.delete(currentCoinId);
        }, 120000);
      }
    });

    $("#searchButton").on("click", function () {
      $("#coinsContainer").empty();
      let userSearch = $("#searchInput").val();
      let userSearchArray = userSearch.split(",");
      for (let index = 0; index < coinsArray.length; index++) {
        if (coinsArray[index].symbol == userSearchArray) {
          addCardtoUi($("#coinsContainer"), coinsArray[index]);
          $(".search-error").html("");
          $("html, body").css({ overflow: "hidden" });
          $(".card").css({ marginLeft: "520px" });
          toggleCheckedCoins();
          return true;
        }
        // $(".search-error").html("Not Found")
        toggleCheckedCoins();
        $("html, body").css({ overflow: "auto" });
      }
      showCoinsCard()
      toggleCheckedCoins();
    });

    function addModalToUi() {
      $(".missingError").html("");
      $(".modal-body").empty();
      tempChartCoinArray = [];
      $(".modal").modal({ backdrop: "static", keyboard: false });

      saveCoinsForReport.forEach((coin) => {
        search(coin, coinsArray);
      });
      tempChartCoinArray.forEach((tempCoin) => {
        addCardtoUi($(".modal-body"), tempCoin);
      });
      $(".modal-body").children(".card").children(".form-check.form-switch").children(".form-check-input").prop("checked", true);
      $("#coinsContainer").children(".card").children(".details_button").attr("onclick", "event.stopPropagation()")

      function search(coin, coinsArray) {
        for (let index = 0; index < coinsArray.length; index++) {
          if (coinsArray[index].symbol == coin) {
            tempChartCoinArray.push(coinsArray[index]);
          }
        }
      }
      $("#saveModal").on("click", function () {
        $("#coinsContainer").children(".card").children(".details_button").attr("onclick", "");
        $(".modal-body").children(".card").children(".details_button").attr("onclick", "");

        if (saveCoinsForReport.size == 5) {
          $(".missingError").html(
            "No changes has been made, uncheck a coin or click on close to abort."
          );
          return false;
        }
        if (saveCoinsForReport.size < 5) {
          $(".modal").modal("hide");
          $(".modal-body").empty();
          toggleCheckedCoins();
        }
      });

      $(".btn.btn-secondary").on("click", function () {
        if (saveCoinsForReport.size == 5) {
          tempChartCoinArray = [];
          $("#coinsContainer").children(".card").children(".details_button").attr("onclick", "");
          $(".modal-body")
            .children(".card")
            .children(".details_button")
            .attr("onclick", "");
          $(".modal-body").empty();
          toggleCheckedCoins();
        }
        if (saveCoinsForReport.size < 5) {
          $("#coinsContainer").children(".card").children(".details_button").attr("onclick", "");
          tempChartCoinArray = [];
          $(".modal-body").empty();
          toggleCheckedCoins();
        }
      });
    }
    function toggleCheckedCoins() {
      $(".form-check-input").prop("checked", false);
      saveCoinsForReport.forEach((toggledCoin) => {
        $(`#${toggledCoin}`).prop("checked", true);
      });
   
    }
    $("#counterB").on("click", function () {
    saveCoinsForReport.clear()
    toggleCheckedCoins()
    $("#counterToggle").html("0")
      counterButton = 0
    })
    function toggleCoin(toggleProp, coinSymbol) {
      if (toggleProp == true) {
        if (saveCoinsForReport.size < 5) {
          saveCoinsForReport.add(coinSymbol);
          counterButton++
          $("#counterToggle").html(counterButton)
        } else {
          $((toggleProp = false));
          addModalToUi();
        }
      } else {
        saveCoinsForReport.delete(coinSymbol);
        counterButton--
        $("#counterToggle").html(counterButton)
      }
    }
    $("#homeB").on("click", function () {
      $(".chart").css("display", "none");
      $(".search-error").html("");
      let progressLiveReport = $(
        `<div class="progress-page"><img src="images/loading.gif"></div>`
      );
      $("#coinsContainer").append(progressLiveReport);
      $("#coinsContainer").empty();
      showCoinsCard();
      toggleCheckedCoins();
      $("#counterB").show()
      $(".secondHeading").show()
      $("html ,body").css({ overflow: "auto" });
    });

    $("#aboutB").on("click", function aboutPage() {
      $("#coinsContainer").empty();
      $(".chart").css("display", "none");

      let aboutContainer = `<div class="about_Container">
    <h2 class="about_Heading">Welcome aboard</h2><br>
    <h6 class="about_secondH">Meet Ron Motola,</h6><hr>
    <p class="about_info">A 26 Years old student for fullstack web devloper, living in givatayim.
    This project is about a Cryptocurrency prices and live reports, you can watch for all of your favorites coins from all the coins available in the market, track them on the "Home" page or search them with the search system by their symbol than you can toggles the coins you are looking for and watch their live reports graphs on the "Live Reports" page.  </p>
    <img class="about_image" src="images/Me.jpg">
    <div class="social"><a href="https://www.facebook.com/ron.motola.1" class="fa fa-facebook"></a>
    <a href="https://www.instagram.com/ron_moto/" class="fa fa-instagram"></a>
    <a href="#" class="fa fa-linkedin"></a></div>
  </div>
    `;
      $("#coinsContainer").append(aboutContainer);
      $("html, body").css({ overflow: "hidden" });
      $("#counterB").hide()
      $(".secondHeading").css("display", "none");
    });

    $("#liveReportB").on("click", function liveReport() {
      $("#coinsContainer").empty();
      $(".chart").css("display", "block");
      loadChart();
      let saveCoinsForReportString = Array.from(saveCoinsForReport).join(",");
      getCoinForReport(saveCoinsForReportString);

      function loadChart() {
        let progressLiveReport = $(
          `<div class="progress-page"><img src="images/loading.gif"></div>`
        );
        $("#coinsContainer").append(progressLiveReport);
        $("html, body").css({ overflow: "hidden" });
        $(".secondHeading").css("display", "none");
        $("#counterB").hide()
      }
      if (saveCoinsForReport.size == 0) {
        let noCoinsForReport = $(`<div class="empty-report">
        <img src="images/nocoinserror4.jpg" class="no-coins-error">
            <div class="typing-demo">
              You need to choose at least one coin.
           </div>
        </div>`);
        $("#coinsContainer").append(noCoinsForReport);
      }
      function getCoinForReport(saveCoinsForReportString) {
        let chart = new CanvasJS.Chart("chartContainer", {
          exportEnabled: true,
          animationEnabled: true,
          zoomEnabled: true,
          title: {
            text: "Live Report Coins To USD",
          },
          axisX: {
            title: "Volume (Seconds)",
            labelAngle: 0,
            labelTextAlign: "center",
            titleFontFamily: "Raleway",
            labelFontSize: 18,
            labelFontFamily: "Raleway",
          },
          axisY: {
            prefix: "$",
            title: "Coin Value",
            titleFontColor: "#4F81BC",
            lineColor: "#4F81BC",
            labelFontColor: "#4F81BC",
            tickColor: "#4F81BC",
          },
          toolTip: {
            shared: true,
          },
          legend: {
            cursor: "pointer",
            itemclick: toggleDataSeries,
            fontSize: 20,
            verticalAlign: "top",
            fontColor: "Grey",
          },
          data: [],
        });

        function toggleDataSeries(e) {
          if (
            typeof e.dataSeries.visible === "undefined" ||
            e.dataSeries.visible
          ) {
            e.dataSeries.visible = false;
          } else {
            e.dataSeries.visible = true;
          }
          chart.render();
        }
        $.get(`https://min-api.cryptocompare.com/data/pricemulti?fsyms=${saveCoinsForReportString}&tsyms=USD`,
          function (coinsData) {
            $(".progress-page").remove();
            $.each(coinsData, function (key, value) {
              value = JSON.stringify(value).replace('"USD":', "").replace("{", "").replace("}", "");
              let time = new Date().getTime();
              let CoinData = {
                type: "spline",
                name: key,
                showInLegend: true,
                xValueType: "dateTime",
                yValueFormatString: "$####.00",
                xValueFormatString: "hh:mm:ss TT",
                dataPoints: [{ x: time, y: parseInt(value) }],
              };
              chart.addTo("data", CoinData);
            });
            chart.render();
            refreshChart();
          }
        );

        function refreshChart() {
          let index = 0;
          $.get(
            `https://min-api.cryptocompare.com/data/pricemulti?fsyms=${saveCoinsForReportString}&tsyms=USD`,
            function (coinsData) {
              $.each(coinsData, function (key, value) {
                value = JSON.stringify(value).replace('"USD":', "").replace("{", "").replace("}", "");
                let time = new Date().getTime();
                let newData = { x: time, y: parseInt(value) };
                chart.data[index].dataPoints.push(newData);
                index++;
              });
              chart.render();
              setTimeout(function () {
                refreshChart();
              },2000);
            }
          );
        }
      }
    });

    $(function getCoinForScrollBar() {
      $.get("https://api.coingecko.com/api/v3/coins/")
        .then(function (coins) {
          initCoinsScrollBar(coins)
          showCoinsTicker()
        })
        .catch(() => console.log("Failed"));
    
    function initCoinsScrollBar(coins) {
      for (let index = 0; index < 50; index++) {
      let symbol = coins[index].symbol;
      let image = coins[index].image;
      let currentCoinValueUsd = coins[index].market_data;
      let priceChangePercentage = coins[index].market_data;
      let priceChangeDay = coins[index].market_data;

      let scrollBarCoins = {
        symbol,
        image,
        priceChangePercentage,
        currentCoinValueUsd,
        priceChangeDay
      };
      scrollBarArrayInfo.push(scrollBarCoins);
    }
  }
  function showCoinsTicker() {
    for (let index = 0; index < scrollBarArrayInfo.length; index++) {
      addDataToScrollBar(scrollBarArrayInfo[index]);
    }
  }
  
    function addDataToScrollBar(scrollBarCoins) {
      let scrollBarContainer = $("#tickerContainer");
      let scrollBar = $(`
      <div class="hitem" id="p0">
      <span><img src="${scrollBarCoins.image.thumb}"class="scroll-bar-image"></span>
      <span class="scroll-bar-name">${scrollBarCoins.symbol}</span>&nbsp;
      <span class="scroll-bar-price">$${scrollBarCoins.currentCoinValueUsd.current_price.usd}</span>&nbsp;
      <span class="scroll-bar-price-change" id="p12">$${scrollBarCoins.priceChangeDay.price_change_24h}</span>
      </div>
   `)
    scrollBarContainer.append(scrollBar);
    }
  })
  });
  $('#counterB').popover({container: 'body', animation: true,})

  $("#myBtn").on("click", function aboutPage() {
    document.body.scrollTop = 0;
    document.documentElement.scrollTop = 0;
  });

  function onButtonClicked(event) {
    let gettingCurrentCoinId = event.attr("id");
    return gettingCurrentCoinId;
  }


})();

