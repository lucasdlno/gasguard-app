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
    this.http.get<any>('https://gasguard-backend.onrender.com/api/status').subscribe({
      next: (resposta) => {
        // 1. Se a API estiver a enviar um histórico completo (uma lista), pegamos sempre a última leitura
        let dados = Array.isArray(resposta) ? resposta[resposta.length - 1] : resposta;

        // 2. Se o banco estiver vazio, não fazemos nada para não quebrar o site
        if (!dados) return;

        // 3. Traduzimos os dados do ESP32 para a nossa tela
        this.sensorData.device_name = dados.id_dispositivo; 
        this.sensorData.gas_level_percentage = dados.nivel_gas;

        // 4. Lógica de Alerta: Se o gás passar de 25%, a tela fica vermelha!
        // (Você pode ajustar esse número para bater com a sensibilidade do seu sensor MQ-2)
        if (dados.nivel_gas >= 25) {
          this.sensorData.status = 'Perigo';
        } else {
          this.sensorData.status = 'Seguro';
        }
      },
      error: (erro) => {
        console.error('Erro de conexão com o Render:', erro);
      }
    });
  }

  ngOnDestroy() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }
}