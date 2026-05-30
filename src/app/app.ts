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
  sensorData: any = { 
    device_name: 'A carregar...', 
    gas_level_percentage: 0, 
    status: 'Seguro' 
  };
  intervalId: any;

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.iniciarLeituraDoSensor();
  }

  iniciarLeituraDoSensor() {
    this.buscarDadosNoBanco(); 
    
    this.intervalId = setInterval(() => {
      this.buscarDadosNoBanco();
    }, 2000); 
  }

  buscarDadosNoBanco() {
    this.http.get<any>('https://gasguard-backend.onrender.com/api/status').subscribe({
      next: (resposta) => {
        // 1. O ESPIÃO VOLTOU! Vamos ver tudo o que chega.
        console.log("DADOS RECEBIDOS DO RENDER:", resposta);

        // 2. Garante que pega a última leitura se for uma lista
        let dados = Array.isArray(resposta) ? resposta[resposta.length - 1] : resposta;

        // 3. Se por algum motivo vier vazio, o espião avisa!
        if (!dados) {
          console.log("Aviso: O banco não retornou dados válidos.");
          return; 
        }

        // 4. ATUALIZAÇÃO DA TELA: Recriando o objeto inteiro para o Angular acordar
        this.sensorData = {
          device_name: dados.device_name,
          gas_level_percentage: dados.gas_level_percentage,
          status: dados.status
        };
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