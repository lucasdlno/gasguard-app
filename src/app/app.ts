import { Component, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './app.html',
  styleUrls: ['./app.css']
})
export class App implements OnDestroy {
  // --- CONTROLE DE TELA ---
  isLoggedIn = false; // O aplicativo sempre começa na tela de Login

  // --- DADOS DO DASHBOARD ---
  sensorData = {
    device_name: 'Cozinha - Apartamento 42',
    gas_level_percentage: 0.2, 
    status: 'Seguro'
  };
  intervalId: any;

  // --- LÓGICA DE LOGIN ---
  fazerLogin() {
    // -------------------------------------------------------------
    // FUTURO: É AQUI QUE O CÓDIGO "PARA VALER" VAI ENTRAR.
    // Você fará uma chamada http.post() para a sua API Python 
    // enviando o usuário e a senha para o PostgreSQL validar.
    // -------------------------------------------------------------
    
    // Por enquanto, aceita qualquer coisa e libera a tela:
    this.isLoggedIn = true;
  }

  fazerLogout() {
    this.isLoggedIn = false;
    this.resetSystem(); // Garante que volta ao normal ao deslogar
  }

  // --- LÓGICA DE SIMULAÇÃO (APRESENTAÇÃO) ---
  simulateLeak() {
    this.sensorData.gas_level_percentage = 2.1;
    this.sensorData.status = 'Perigo';
  }

  resetSystem() {
    this.sensorData.gas_level_percentage = 0.2;
    this.sensorData.status = 'Seguro';
  }

  ngOnDestroy() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }
}