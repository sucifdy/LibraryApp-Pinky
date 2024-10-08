let currentPage = 'home';
let currentBook = null;
let books = [];

const main = document.querySelector('main');

const pageListMainContent = `<h2 class="text-2xl font-bold mb-4">Hot People Reading List</h2>

<table class="min-w-full border border-gray-300">
  <thead>
    <tr>
      <th class="px-6 py-3 bg-gray-100 border-b text-left">Judul</th>
      <th class="px-6 py-3 bg-gray-100 border-b text-left">Penulis</th>
      <th class="px-6 py-3 bg-gray-100 border-b text-left">Tahun Terbit</th>
      <th class="px-6 py-3 bg-gray-100 border-b text-left">Jumlah</th>
      <th class="px-6 py-3 bg-gray-100 border-b text-center">Action</th>
    </tr>
  </thead>
  <tbody>
  </tbody>
</table>`;

const pageEditBookMainContent = `<h2 class="text-2xl font-bold mb-4">Edit Buku</h2>

<form class="max-w-sm mx-auto" onsubmit="return handleEditForm(event)"></form>
`;

const pageAddBookMainContent = `<h2 class="text-2xl font-bold mb-4">Tambah Buku</h2>

<form class="max-w-sm mx-auto" onsubmit="return handleAddForm(event)">
  <div class="mb-4">
    <label for="title" class="block text-gray-700 font-semibold mb-2">Judul Buku</label>
    <input required type="text" id="title" name="title" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500" />
  </div>
  <div class="mb-4">
    <label for="author" class="block text-gray-700 font-semibold mb-2">Penulis Buku</label>
    <input required type="text" id="author" name="author" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500" />
  </div>
  <div class="mb-4">
    <label for="year" class="block text-gray-700 font-semibold mb-2">Tahun Terbit</label>
    <input required type="number" id="year" name="year" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500" />
  </div>
  <div class="mb-4">
    <label for="quantity" class="block text-gray-700 font-semibold mb-2">Jumlah Stok</label>
    <input required type="number" id="quantity" name="quantity" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500" />
  </div>
  <div class="flex justify-center">
    <input type="submit" class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" value="Tambah Buku" />
  </div>
</form>
`;

// Update URL tanpa refresh halaman
function updateURL(page, bookId = null) {
  let url = '/';
  if (page === 'edit' && bookId) {
    url = `/edit/${bookId}`;
  } else if (page === 'add') {
    url = `/add`;
  }
  history.pushState(null, '', url);  
}

async function handleClickEditButton(bookId) {
  try {
    const response = await fetch(`http://localhost:3333/books/${bookId}`);
    currentBook = await response.json();

    currentPage = 'edit';
    loadPage();
  } catch (error) {
    console.log('Terjadi kesalahan saat mengambil data buku', error);
  }
}

async function handleClickDeleteButton(bookId) {
  try {
    await deleteBook(bookId);
    loadPage();
  } catch (error) {
    console.log('Terjadi kesalahan saat menghapus buku', error);
  }
}

async function handleEditForm(event) {
  event.preventDefault();
  const book = {
    title: event.target.title?.value || '',  // Memastikan title ada
    author: event.target.author?.value || '', // Memastikan author ada
    year: event.target.year?.value || 0, // Memastikan year ada
    quantity: event.target.quantity?.value || 0 // Memastikan quantity ada
  };

  // Tambahkan pengecekan untuk currentBook sebelum digunakan
  if (!currentBook || !currentBook.id) {
    console.error('Data buku tidak tersedia untuk diubah.');
    return;
  }

  await editBook(currentBook.id, book); 
  currentBook = null;
  currentPage = 'home';
  loadPage();
}

async function handleAddForm(event) {
  event.preventDefault();

  const book = {
    title: event.target.title?.value || '',  
    author: event.target.author?.value || '', 
    year: event.target.year?.value || 0, 
    quantity: event.target.quantity?.value || 0
  };

  await addBook(book); // Tunggu sampai `addBook` selesai

  currentPage = 'home';
  loadPage(); // Muat halaman lagi setelah menambah buku
}

function handleClickAddNav() {
  currentPage = 'add';
  loadPage();
}

const navLinks = document.querySelectorAll('li a');
navLinks.forEach((navLink) => {
  navLink.addEventListener('click', handleClickAddNav);
});

function generateRows(books) {
  let rows = '';
  if (books.length === 0) {
    rows = `<tr><td colspan="5" class="text-center py-4">Tidak ada buku yang ditemukan</td></tr>`;
  } else {
    books.forEach((book) => {
      rows += `
      <tr class="book-item">
        <td class="px-6 py-4 border-b">${book.title}</td>
        <td class="px-6 py-4 border-b">${book.author}</td>
        <td class="px-6 py-4 border-b">${book.year}</td>
        <td class="px-6 py-4 border-b">${book.quantity}</td>
        <td class="px-6 py-4 border-b text-center">
          <button class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" onclick="handleClickEditButton(${book.id})">Edit</button>
          <button class="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded" onclick="handleClickDeleteButton(${book.id})">Hapus</button>
        </td>
      </tr>`;
    });
  }
  return rows;
}

function generateEditFormInput() {
  return `
    <div class="mb-4">
      <label for="title" class="block text-gray-700 font-semibold mb-2">Judul Buku</label>
      <input required type="text" id="title" name="title" class="w-full px-3 py-2 border border-gray-300 rounded-md" value="${currentBook?.title}">
    </div>
    <div class="mb-4">
      <label for="author" class="block text-gray-700 font-semibold mb-2">Penulis Buku</label>
      <input required type="text" id="author" name="author" class="w-full px-3 py-2 border border-gray-300 rounded-md" value="${currentBook?.author}">
    </div>
    <div class="mb-4">
      <label for="year" class="block text-gray-700 font-semibold mb-2">Tahun Terbit</label>
      <input required type="number" id="year" name="year" class="w-full px-3 py-2 border border-gray-300 rounded-md" value="${currentBook?.year}">
    </div>
    <div class="mb-4">
      <label for="quantity" class="block text-gray-700 font-semibold mb-2">Jumlah Stok</label>
      <input required type="number" id="quantity" name="quantity" class="w-full px-3 py-2 border border-gray-300 rounded-md" value="${currentBook?.quantity}">
    </div>
    <div class="flex justify-center">
      <input type="submit" class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" value="Simpan Perubahan">
    </div>
  `;
}

function loadPage() {
  if (currentPage === 'home') {
    main.innerHTML = pageListMainContent;
    fetchBooks().then(() => {
      const tableBody = main.querySelector('tbody');
      tableBody.innerHTML = generateRows(books);
    });
    updateURL('home');
  } else if (currentPage === 'edit') {
    main.innerHTML = pageEditBookMainContent;
    const form = main.querySelector('form');
    form.innerHTML = generateEditFormInput();
    updateURL('edit', currentBook.id);
  } else if (currentPage === 'add') {
    main.innerHTML = pageAddBookMainContent;
    updateURL('add');
  }
}

async function fetchBooks() {
  try {
    const response = await fetch('http://localhost:3333/books');
    books = await response.json();
  } catch (error) {
    console.log('Terjadi kesalahan saat mengambil data buku', error);
  }
}

async function addBook(book) {
  try {
    const response = await fetch('http://localhost:3333/books', {
      method: 'POST',  // Pastikan method POST ada
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(book)  // Kirim data buku baru
    });

    if (response.ok) {
      const addedBook = await response.json();
      console.log('Book added successfully:', addedBook);
      return addedBook; // return agar diproses di tempat lain
    } else {
      console.error('Failed to add book');
    }
  } catch (error) {
    console.error('Error adding book:', error);
  }
}

function handleAddBookForm(event) {
  event.preventDefault();
  
  const newBook = {
    title: event.target.title.value,
    author: event.target.author.value,
    year: event.target.year.value,
    quantity: event.target.quantity.value
  };

  addBook(newBook).then(() => {
    loadPage(); // Refresh halaman setelah buku berhasil ditambahkan
  });
}

async function editBook(bookId, book) {
  try {
    const response = await fetch(`http://localhost:3333/books/${bookId}`, {
      method: 'PUT', 
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(book) // Kirim data buku yang diubah
    });
    return await response.json();
  } catch (error) {
    console.log('Terjadi kesalahan saat mengedit buku', error);
  }
}

async function deleteBook(bookId) {
  try {
    const response = await fetch(`http://localhost:3333/books/${bookId}`, {
      method: 'DELETE',
    });
    return response.json();
  } catch (error) {
    console.log('Terjadi kesalahan saat menghapus buku', error);
  }
}

loadPage();
