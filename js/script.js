const url = 'https://raw.githubusercontent.com/mcmarin9/imdb/master/imdb_top_1000.json';

const itemsPerPage = 21;
let currentPage = 1;

function showPage(data, page) {
  const startIndex = (page - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;

  const cardsContainer = document.getElementById('card-list');
  cardsContainer.innerHTML = '';

  const gridContainer = document.createElement('div');
  gridContainer.className = 'uk-grid uk-child-width-1-2@s';

  for (let i = startIndex; i < endIndex && i < data.length; i++) {
    const movie = data[i];
    const card = document.createElement('div');
    card.className = 'uk-card uk-card-default uk-grid-collapse uk-child-width-1-2@s movie-card';
    card.setAttribute('uk-grid', '');
    card.innerHTML = `
        <div class="uk-card-media-left uk-cover-container">
          <img src="${movie.Poster_Link}" uk-image class="movie-image" alt="Poster de la película ${movie.Series_Title}">
        </div>
        <div class="uk-card-body">
            <h3 class="uk-card-title">${movie.Series_Title}</h3>
            <div class='anio-nota'>
                <p><span uk-icon="icon: calendar"></span> ${movie.Released_Year}</p>
                <p><span class="uk-badge uk-badge-large">${movie.IMDB_Rating}</span></p>
            </div>
            <p>${movie.Genre}</p>
            <p><span uk-icon="icon: clock"></span> ${movie.Runtime}</p>
            <button class="uk-button uk-button-default" type="button" uk-toggle="target: #more-info-${i}">Ver más</button>
        </div>
        <div id="more-info-${i}" uk-modal>
            <div class="uk-modal-dialog uk-modal-body">
                <h2 class="uk-modal-title">Detalles</h2>
                <p>Director: ${movie.Director}</p>
                <p>Certificado: ${movie.Certificate}</p>
                <p>Actores: ${movie.Star1}, ${movie.Star2}, ${movie.Star3}, ${movie.Star4}</p>
                <p>Número de Votos: ${movie.No_of_Votes}</p>
                <p>Ingresos: ${movie.Gross}</p>
                <p>Resumen: ${movie.Overview}</p>
                <p>Meta score: ${movie.Meta_score}</p>
            </div> 
        </div>
            `;
    cardsContainer.appendChild(card);
  }
}

function updatePagination(data) {
  const totalPages = Math.ceil(data.length / itemsPerPage);

  const paginationContainer = document.getElementById('pagination');
  paginationContainer.innerHTML = '';

  const maxPagesToShow = 10;
  const pagesBeforeCurrent = Math.floor(maxPagesToShow / 2);
  const pagesAfterCurrent = Math.ceil(maxPagesToShow / 2);

  const startPage = Math.max(currentPage - pagesBeforeCurrent, 1);
  const endPage = Math.min(startPage + maxPagesToShow - 1, totalPages);

  const firstPageItem = document.createElement('li');
  firstPageItem.innerHTML = `<a href="#"><span uk-icon="icon: chevron-double-left"></span></a>`;
  firstPageItem.addEventListener('click', () => {
    currentPage = 1;
    showPage(data, currentPage);
    updatePagination(data);
  });
  paginationContainer.appendChild(firstPageItem);

  const prevPageItem = document.createElement('li');
  prevPageItem.innerHTML = `<a href="#"><span uk-icon="icon: chevron-left"></span></a>`;
  prevPageItem.addEventListener('click', () => {
    if (currentPage > 1) {
      currentPage--;
      showPage(data, currentPage);
      updatePagination(data);
    }
  });
  paginationContainer.appendChild(prevPageItem);

  for (let i = startPage; i <= endPage; i++) {
    const listItem = document.createElement('li');
    listItem.innerHTML = `<a href="#">${i}</a>`;
    listItem.addEventListener('click', () => {
      currentPage = i;
      showPage(data, currentPage);
      updatePagination(data);
    });

    if (i === currentPage) {
      listItem.classList.add('pagination-active');
    }

    paginationContainer.appendChild(listItem);
  }

  const nextPageItem = document.createElement('li');
  nextPageItem.innerHTML = `<a href="#"><span uk-icon="icon: chevron-right"></span></a>`;
  nextPageItem.addEventListener('click', () => {
    if (currentPage < totalPages) {
      currentPage++;
      showPage(data, currentPage);
      updatePagination(data);
    }
  });
  paginationContainer.appendChild(nextPageItem);

  const lastPageItem = document.createElement('li');
  lastPageItem.innerHTML = `<a href="#"><span uk-icon="icon:  chevron-double-right
  "></span></a>`;
  lastPageItem.addEventListener('click', () => {
    currentPage = totalPages;
    showPage(data, currentPage);
    updatePagination(data);
  });
  paginationContainer.appendChild(lastPageItem);
}

function createBarChart(data, containerId, showTitle) {
  data.sort((a, b) => a.Released_Year - b.Released_Year);

  const years = data.map(movie => movie.Released_Year);
  const grossData = data.map(movie => parseFloat(movie.Gross.replace(/,/g, '')));

  const barChartContainer = document.getElementById(containerId);
  let axisColor;
  if (document.querySelector('.uk-offcanvas-bar').contains(barChartContainer)) {
    axisColor = '#FFFFFF';
  } else {
    axisColor = '#333';
  }
  const barChart = echarts.init(barChartContainer);

  const option = {
    darkMode: document.body.classList.contains('high-contrast'),
    xAxis: {
      type: 'category',
      data: years,
      axisLine: {
        lineStyle: {
          color: axisColor
        }
      }
    },
    yAxis: {
      type: 'value',
      name: 'Ingresos',
      nameTextStyle: {
        color: axisColor
      },
      axisLine: {
        lineStyle: {
          color: axisColor
        }
      }
    },
    series: [{
      data: grossData,
      type: 'bar'
    }]
  };

  if (showTitle) {
    document.getElementById(containerId + '-title').innerText = 'Ingresos por Año';
  }

  barChart.setOption(option);
}

function createPieChart(data, containerId, showTitle) {
  const years = [...new Set(data.map(movie => movie.Released_Year))];
  const movieCountByYear = years.map(year => {
    return {
      name: year,
      value: data.filter(movie => movie.Released_Year === year).length
    };
  });

  const pieChartContainer = document.getElementById(containerId);
  let labelColor;
  if (document.querySelector('.uk-offcanvas-bar').contains(pieChartContainer)) {
    labelColor = '#FFFFFF';
  } else {
    labelColor = '#333';
  }
  const pieChart = echarts.init(pieChartContainer);

  const option = {
    darkMode: document.body.classList.contains('high-contrast'),
    series: [{
      type: 'pie',
      radius: '55%',
      data: movieCountByYear,
      label: {
        color: labelColor
      }
    }]
  };

  if (showTitle) {
    document.getElementById(containerId + '-title').innerText = 'Películas por Año';
  }

  pieChart.setOption(option);
}

let data;

document.addEventListener('DOMContentLoaded', function () {
  fetch(url)
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    })
    .then(fetchedData => {
      console.log('Datos obtenidos correctamente:', fetchedData);
      data = fetchedData;
      showPage(data, currentPage);
      updatePagination(data);

      const offcanvas = UIkit.offcanvas('#offcanvas-nav');

      offcanvas.$el.addEventListener('shown', function () {
        createBarChart(data, 'bar-chart', true);
        createPieChart(data, 'pie-chart', true);
      });
    })
    .catch(error => {
      console.error('Error al obtener el JSON:', error);
    });
});


document.addEventListener('DOMContentLoaded', (event) => {
  UIkit.util.on('#offcanvas-nav', 'show', function () {
    console.log('offcanvas-nav show');
    document.querySelector('header > :nth-child(2)').classList.add('header-shift');
  });

  UIkit.util.on('#offcanvas-nav', 'hide', function () {
    console.log('offcanvas-nav hide');
    document.querySelector('header > :nth-child(2)').classList.remove('header-shift');
  });

  UIkit.util.on('#ingresos-por-anio', 'shown', function () {
    setTimeout(function () {
      createBarChart(data, 'bar-chart-modal', false);
    }, 0);
  });

  UIkit.util.on('#peliculas-por-anio', 'shown', function () {
    setTimeout(function () {
      createPieChart(data, 'pie-chart-modal', false);
    }, 0);
  });
});



// Alto Contraste
function toggleHighContrast() {
  document.body.classList.toggle('high-contrast');
}

document.getElementById('toggleContrastButton').addEventListener('click', toggleHighContrast);