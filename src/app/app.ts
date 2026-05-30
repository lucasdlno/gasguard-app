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
  // Dados iniciais antes da placa enviar a primeira leitura
  sensorData: any = { 
    device_name: 'A carregar...', 
    gas_level_percentage: 0, 
    status: 'Seguro' 
  };
  intervalId: any;

  constructor(private http: HttpClient) {}

  ngOnInit() {
    // Sem tela de login, começamos a ler o banco de dados imediatamente!
    this.iniciarLeituraDoSensor();
  }

  iniciarLeituraDoSensor() {
    this.buscarDadosNoBanco(); // Lê a primeira vez
    
    // Continua a ler a cada 2 segundos
    this.intervalId = setInterval(() => {
      this.buscarDadosNoBanco();
    }, 2000); 
  }

  buscarDadosNoBanco() {
    this.http.get<any>('https://gasguard-backend.onrender.com/api/status').subscribe({
      next: (resposta) => {
        // Se a API mandar uma lista, pegamos sempre a última leitura da fila
        let dados = Array.isArray(resposta) ? resposta[resposta.length - 1] : resposta;

        if (!dados) return; // Se vier vazio, ignora e tenta de novo depois

        // Ligar as chaves exatas que o seu ESP32 está a enviar
        this.sensorData.device_name = dados.id_dispositivo; 
        this.sensorData.gas_level_percentage = dados.nivel_gas;

        // Se o gás passar de 25, muda o painel para vermelho!
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