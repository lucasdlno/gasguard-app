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
  // INÍCIO AUTOMÁTICO
  // ==========================================
  ngOnInit() {
    // Como tiramos o login, a leitura começa assim que o site abre!
    this.iniciarLeituraDoSensor();
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
        // O ESPIÃO: Isso vai imprimir no F12 exatamente o que chegou do banco!
        console.log("DADOS RECEBIDOS DO RENDER:", resposta);

        // Se o Python mandar uma lista, pegamos a última leitura. Se for um item só, usamos ele mesmo.
        let dados = Array.isArray(resposta) ? resposta[resposta.length - 1] : resposta;

        if (!dados) {
          console.log("O banco de dados está vazio no momento.");
          return;
        }

        // Atualizando a tela com as variáveis corretas
        this.sensorData.device_name = dados.device_name; 
        this.sensorData.gas_level_percentage = dados.gas_level_percentage;
        this.sensorData.status = dados.status;
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