<template>
  <div class="container py-4">
    <h1 class="text-center mb-4">🎬 Organizador de peliculas UPVM 🦅</h1>

    <!-- Formulario -->
    <div class="card shadow-sm mb-4">
      <div class="card-body">
        <h5 class="card-title">{{ editing ? 'Editar película' : 'Agregar película' }}</h5>
        <form @submit.prevent="saveMovie">
          <div class="row g-3">
            <div class="col-md-6">
              <label class="form-label">Título</label>
              <input v-model="movie.title" type="text" class="form-control" required />
            </div>
            <div class="col-md-3">
              <label class="form-label">Año</label>
              <input v-model.number="movie.year" type="number" class="form-control" required />
            </div>
            <div class="col-md-3">
              <label class="form-label">Duración (min)</label>
              <input v-model.number="movie.runtime" type="number" class="form-control" />
            </div>
            <div class="col-12">
              <label class="form-label">Trama</label>
              <textarea v-model="movie.plot" class="form-control" rows="2"></textarea>
            </div>
            <div class="col-md-6">
              <label class="form-label">Géneros (coma separados)</label>
              <input v-model="genresInput" type="text" class="form-control" />
            </div>
            <div class="col-md-6">
              <label class="form-label">Elenco (coma separados)</label>
              <input v-model="castInput" type="text" class="form-control" />
            </div>
          </div>

          <div class="mt-3 text-end">
            <button type="submit" class="btn btn-primary me-2">
              <i v-if="editing" class="bi bi-pencil-fill"></i>
              <i v-else class="bi bi-plus-lg"></i>
            </button>
            <button v-if="editing" type="button" @click="cancelEdit" class="btn btn-secondary"><i class="bi bi-x-circle"></i></button>
          </div>
        </form>
      </div>
    </div>

    <!-- Tabla -->
    <div class="table-responsive">
      <table class="table table-striped align-middle">
        <thead class="table-dark">
          <tr>
            <th>Título</th>
            <th>Año</th>
            <th>Duración</th>
            <th>Géneros</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="m in movies" :key="m._id">
            <td>{{ m.title }}</td>
            <td>{{ m.year }}</td>
            <td>{{ m.runtime || '-' }}</td>
            <td>{{ m.genres?.join(', ') }}</td>
            <td>
              <div class="d-flex flex-column flex-sm-row gap-2 align-items-center justify-content-end">
                <button class="btn btn-sm btn-warning" @click="editMovie(m)"><i class="bi bi-pencil-fill"></i></button>
                <button class="btn btn-sm btn-danger" @click="deleteMovie(m._id)"><i class="bi bi-trash-fill"></i></button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

  </div>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      movies: [],
      movie: { title: '', year: '', plot: '', genres: [], runtime: '', cast: [] },
      genresInput: '',
      castInput: '',
      editing: false,
      editingId: null,
      apiUrl: import.meta.env.VITE_API_URL
    };
  },
  mounted() {
    this.getMovies();
  },
  methods: {
    async getMovies() {
      try {
        const res = await axios.get(this.apiUrl);
        this.movies = res.data;
      } catch (err) {
        console.error(err);
      }
    },
    async saveMovie() {
      this.movie.genres = this.genresInput.split(',').map(g => g.trim()).filter(Boolean);
      this.movie.cast = this.castInput.split(',').map(c => c.trim()).filter(Boolean);

      try {
        if (this.editing) {
          await axios.put(`${this.apiUrl}/${this.editingId}`, this.movie);
        } else {
          await axios.post(this.apiUrl, this.movie);
        }
        this.resetForm();
        this.getMovies();
      } catch (err) {
        console.error(err);
      }
    },
    editMovie(m) {
      this.movie = { ...m };
      this.genresInput = m.genres?.join(', ') || '';
      this.castInput = m.cast?.join(', ') || '';
      this.editing = true;
      this.editingId = m._id;
    },
    cancelEdit() {
      this.resetForm();
    },
    async deleteMovie(id) {
      if (!confirm('¿Eliminar esta película?')) return;
      try {
        await axios.delete(`${this.apiUrl}/${id}`);
        this.getMovies();
      } catch (err) {
        console.error(err);
      }
    },
    resetForm() {
      this.movie = { title: '', year: '', plot: '', genres: [], runtime: '', cast: [] };
      this.genresInput = '';
      this.castInput = '';
      this.editing = false;
      this.editingId = null;
    }
  }
};
</script>

<style>
body {
  background-color: #f8f9fa;
}
</style>
