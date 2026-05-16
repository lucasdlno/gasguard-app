import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './app.html',
  styleUrls: ['./app.css']
})
export class App implements OnInit, OnDestroy {
  // --- CONTROLO DE ECRÃ ---
  isLoggedIn = false;

  // --- DADOS DO DASHBOARD ---
  // Começa com valores a zero até o Python enviar os dados reais
  sensorData: any = { 
    device_name: 'A carregar...', 
    gas_level_percentage: 0, 
    status: 'Seguro' 
  };
  intervalId: any;

  constructor(private http: HttpClient) {}

  // ==========================================
  // CORREÇÃO: O ngOnInit que o Angular estava exigindo
  // ==========================================
  ngOnInit() {
    // Podemos deixar vazio, pois a nossa leitura só começa ao fazer Login.
  }

  // --- LÓGICA DE LOGIN ---
  fazerLogin() {
    this.isLoggedIn = true;
    this.iniciarLeituraDoSensor(); // Assim que entra, começa a ler do banco
  }

  fazerLogout() {
    this.isLoggedIn = false;
    if (this.intervalId) {
      clearInterval(this.intervalId); // Pára as requisições se o utilizador sair
    }
  }

  // --- LÓGICA DE LIGAÇÃO AO BACKEND (PYTHON) ---
  iniciarLeituraDoSensor() {
    this.buscarDadosNoBanco(); // Lê imediatamente a primeira vez
    
    // Fica a ler o banco de dados a cada 2 segundos
    this.intervalId = setInterval(() => {
      this.buscarDadosNoBanco();
    }, 2000); 
  }

  buscarDadosNoBanco() {
    // Faz o pedido GET ao Python
    this.http.get('https://gasguard-backend.onrender.com/api/status').subscribe({
      next: (dadosReais) => {
        this.sensorData = dadosReais; // Atualiza o ecrã com os dados do PostgreSQL
      },
      error: (erro) => {
        console.error('Erro ao buscar dados da API Python:', erro);
      }
    });
  }

  ngOnDestroy() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }
}