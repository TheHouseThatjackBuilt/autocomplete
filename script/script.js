
const input = document.querySelector('.search__input');
const result = [...document.querySelectorAll('.result__item')];
const note = document.querySelector('.note');
// cleaning the search results field
const clear = () => {
    let searchOptions = document.querySelectorAll('.result__header');
    if (searchOptions.length !== 0) searchOptions.forEach(e => e.remove());
    if (result[0].classList.contains('result__item_empty')) result[0].classList.remove('result__item_empty');
    result.forEach(e => e.classList.add('result__item_hidden'));
};
const debounce = (fn, delay) => {
    let inDebounce;
    return async function () {
        clearTimeout(inDebounce);
        inDebounce = setTimeout(() => fn.apply(this, arguments), delay);
    }
};
const sendRequest = url =>
    fetch(url)
        .then(response => response.json())
        .then(response => response.items);

const autocomplete = (element, counter, arr) => {
    const headerName = document.createElement('h3');
    headerName.textContent = element.name.slice(0, 30);
    headerName.classList.add('result__header');
    arr[counter].append(headerName);
    arr[counter].classList.remove('result__item_hidden');
};
const search = e => {
    const requestURL = 'https://api.github.com/search/repositories?q=';
    if (e.target.value === '') return;
    return sendRequest(`${requestURL}${e.target.value}&sort=stars`);
};
// if we didn't find anything - then:
const notice = el => {
    const headerName = document.createElement('h3');
    headerName.textContent = 'Nothing found :(';
    headerName.classList.add('result__header');
    el.append(headerName);
    el.classList.remove('result__item_hidden');
    el.classList.add('result__item_empty');
};
// creating note elements, return li with '.note__item_hidden' to be processed later.
const createNote = ({ name, owner: { login, avatar_url }, stargazers_count }) => {
    const li = document.createElement('li');
    const noteContainer = document.createElement('div');
    const imgContainer = document.createElement('div');
    const contentContainer = document.createElement('div');
    const headerRepo = document.createElement('h3');
    const ownerRepo = document.createElement('p');
    const ownerAvatar = document.createElement('img');
    const ratingRepo = document.createElement('p');
    const close = document.createElement('button');

    headerRepo.textContent = `name: ${name}`;
    ownerRepo.textContent = `Owner repo: ${login}`;
    ownerAvatar.src = avatar_url;
    ratingRepo.textContent = `stars: ${stargazers_count}`;

    headerRepo.classList.add('note__header');
    ownerRepo.classList.add('note__login');
    ratingRepo.classList.add('note__rating');
    contentContainer.classList.add('note__content');
    imgContainer.classList.add('note__img');
    close.classList.add('note__close');
    noteContainer.classList.add('note__container');
    li.classList.add('note__item_hidden');
    li.classList.add('note__item');

    contentContainer.append(headerRepo, ownerRepo, ratingRepo);
    imgContainer.append(ownerAvatar);
    noteContainer.append(imgContainer, contentContainer, close);
    li.append(noteContainer);
    note.append(li);
    return li;
};
// remove the note.
const deleteNote = e => {
    if (!e.target.classList.contains('note__close')) return;
    const element = e.target.closest('.note__item');
    element.classList.add('note__item_hidden');
    setTimeout(() => element.remove(), 500)
};
note.addEventListener('click', deleteNote);
// anonymous self-invoking function to encapsulate the 'response' variable.
(() => {
    let response;

    input.addEventListener('input', debounce(async function (e) {
        if (!result[0].classList.contains('result__item_hidden')) clear();
        if (this.value.length < 3) return;

        try { response = await search(e) }
        catch(e) { throw e }

        if (response.length > result.length) response.length = result.length;
        if (response.length === 0) notice(result[0]);
        else response.forEach((element, i) => autocomplete(element, i, result));
    }, 500));

    result.forEach(e => e.addEventListener('click', () => {
        // in setTimout removing class 'note__item_hidden' for appearance animation.
        const name = e.firstElementChild.innerHTML;
        const element = response.find(e => e.name === name);
        const li = createNote(element);
        setTimeout(() => li.classList.remove('note__item_hidden'), 100);
        clear();
        input.value = '';
    }));
})();

