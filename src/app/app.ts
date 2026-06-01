import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core'; 
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

  constructor(
    private http: HttpClient,
    private cdr: ChangeDetectorRef // <-- Injetamos o despertador aqui!
  ) {}

  ngOnInit() {
    this.iniciarLeituraDoSensor();
  }

  iniciarLeituraDoSensor() {
    this.buscarDadosNoBanco(); 
    
    this.intervalId = setInterval(() => {
      this.buscarDadosNoBanco();
    }, 1000); 
  }

  buscarDadosNoBanco() {
    this.http.get<any>('https://gasguard-backend.onrender.com/api/status').subscribe({
      next: (resposta) => {
        console.log("DADOS RECEBIDOS DO RENDER:", resposta);

        let dados = Array.isArray(resposta) ? resposta[resposta.length - 1] : resposta;

        if (!dados) {
          console.log("Aviso: O banco não retornou dados válidos.");
          return; 
        }

        // ==========================================
        // A CORREÇÃO DA MATEMÁTICA ENTRA AQUI
        // ==========================================
        
        // 1. Pega o valor que chegou da nuvem
        const valorCru = dados.gas_level_percentage !== undefined ? dados.gas_level_percentage : dados.nivel_gas;
        
        // 2. Força o JavaScript a tratar o valor estritamente como um Número matemático
        const nivelGas = Number(valorCru);
        const nomeAparelho = dados.device_name || dados.id_dispositivo || 'apt_42';

        // 3. Atualizamos os dados na memória (O Angular decide sozinho se é Perigo ou Seguro)
        this.sensorData = {
          device_name: nomeAparelho,
          gas_level_percentage: nivelGas,
          status: nivelGas >= 25 ? 'Perigo' : 'Seguro'
        };

        // ACORDA O ANGULAR À FORÇA! Isso obriga a tela HTML a piscar e mostrar os dados novos na mesma hora.
        this.cdr.detectChanges(); 
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