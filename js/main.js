var canvas, contexto, ALTURA, LARGURA, frames = 0, maxPulos = 3, velocidade = 8,
estadoAtual, record,

        estados = {
            jogar: 0,
            jogando: 1,
            perdeu: 2
        },

        chao = {
            y: 550,
            altura: 50,
            cor: "#ffdf70",

            desenhar: function() {
                contexto.fillStyle = this.cor//pega a cor definida no objeto
                contexto.fillRect(0, this.y, LARGURA, this.altura)//cria o objeto a partir do x e y definidos
            }
        },

        bloco = {
            x: 50,
            y: 0,
            altura: 50,
            largura: 50,
            cor: "#ff4e4e",
            gravidade: 1.6,
            velocidade: 0,
            forcaDoPulo: 23.6,
            qntPulos: 0,
            score: 0,

            atualizar: function() {
                this.velocidade += this.gravidade
                this.y += this.velocidade

                if (this.y > chao.y - this.altura && estadoAtual != estados.perdeu){// esse if faz com que o bloco não passe do chão && com que o bloco caia quando o jogador perder
                this.y = chao.y - this.altura
                this.qntPulos = 0//zera os pulos quando o personagem encosta no chão
                this.velocidade = 0//zera a velocidade enquanto o bloco esta no chão.
                }
            },

            pula: function() {

                if(this.qntPulos < maxPulos){
                this.velocidade = -this.forcaDoPulo
                this.qntPulos ++
                }
            },

            reset: function(){
                this.velocidade = 0
                this.y = 0
                if(this.score > record){
                    localStorage.setItem("record", this.score)
                    record = this.score
                }

                this.score = 0
            },

            desenhar: function() {
                contexto.fillStyle = this.cor//define a cor do bloco
                contexto.fillRect(this.x, this.y, this.altura, this.largura)// cria o objeto a partir doas informações do bloco
            }
        },
        
        obstaculos = {
            _obs: [],
            cores: ["$ffbc1c", "#ff1c1c", "#ff85e1", "#2b5970", "#78ff5d"],
            tempoInsere: 0,

            insere: function() {// essa função inserirá os obstáculos na tela
                this._obs.push({
                    x: LARGURA,
                    //largura: 30 + Math.floor(21 * Math.random()),//aqui fará com que a largura dele seja aleatória que varia de 30 a 50 pixels
                    largura: 50,
                    altura: 30 + Math.floor(120 * Math.random()),//já aqui definirá uma altura entre 30 e 120 pixels
                    cor: this.cores[Math.floor(5 * Math.random())]//aqui ele sortea a cor de uma das cinco definidas na variavel cores
                })

                this.tempoInsere = 30 + Math.floor(21 * Math.random())// faz o jogo gerar os espaços entre os obstaculos de forma randomica
            },

            atualizar: function() {//faz os obstaculos andar pela tela.
                if(this.tempoInsere == 0)// faz ele inserir um novo obstaculo somente quando o tempoo for igual a 0
                    this.insere()
                else
                    this.tempoInsere--

                for (var i = 0, tam = this._obs.length; i < tam; i++){
                    var obs = this._obs[i]

                    obs.x -= velocidade

                    if(bloco.x < obs.x + obs.largura && bloco.x + bloco.largura >= obs.x && bloco.y + bloco.altura >= chao.y - obs.altura){
                        estadoAtual = estados.perdeu// faz com que no momento que o jogador esbarra num obstaculo ele perca.
                    }

                    else if(obs.x == 0){
                        bloco.score++
                    }

                    else if(obs.x <= -obs.largura){
                        this._obs.splice(i, 1)// faz o obstaculo sumir ao chegar a borda esquerda da tela
                        tam--//corrige o erro do for tentar acessar um elemento que foi removido
                        i--
                    }
                }
            },

            limpa: function() {
                this._obs = []// essa função zera o vetos _obs
            },

            desenhar: function() {//essa função desenhará os obstaculos sorteando as cores e medidas.
                for (var i = 0, tam = this._obs.length; i < tam; i++){
                    var obs = this._obs[i]
                    contexto.fillStyle = obs.cor
                    contexto.fillRect(obs.x, chao.y - obs.altura, obs.largura, obs.altura)
                }
            }
        }

        function main(){
            //função principal
            ALTURA = innerHeight
            LARGURA = innerWidth

            if (LARGURA >= 800){
                LARGURA = 800
                ALTURA = 600
            }
            canvas = document.createElement("canvas")//cria a tela do jogo
            canvas.width = LARGURA
            canvas.height = ALTURA
            canvas.style.border = "1px solid #000"

            contexto = canvas.getContext("2d")
            document.body.appendChild(canvas)

            document.addEventListener("mousedown",clique)

            estadoAtual = estados.jogar
            record = localStorage.getItem("record")//armazena pontuação

            if (record == null){
                record = 0
            }

            executar()
        }
        function clique(event){
            if (estadoAtual == estados.jogando){
                bloco.pula()
            } else if (estadoAtual == estados.jogar){
                estadoAtual = estados.jogando
            } else if (estadoAtual == estados.perdeu && bloco.y >= 2 * ALTURA){
                estadoAtual = estados.jogar
                obstaculos.limpa()
                bloco.reset()
            }
        }
        function executar(){
            atualizar()
            desenhar()

            requestAnimationFrame(executar)
        }
        function atualizar(){
            frames++
            bloco.atualizar()

            if (estadoAtual == estados.jogando){
                obstaculos.atualizar()
            }       
        }
        function desenhar(){
            contexto.fillStyle = "#50beff"
            contexto.fillRect(0, 0, LARGURA, ALTURA)

            contexto.fillStyle = "#fff"
            contexto.font = "50px Arial"
            contexto.fillText(bloco.score, 30, 68)
            
        if (estadoAtual == estados.jogar){
            contexto.fillStyle = "green"
            contexto.fillRect(LARGURA / 2 - 50, ALTURA / 2 - 50, 100, 100)// cria o quadrado verde para iniciar o jogo
        }
        
        else if (estadoAtual == estados.perdeu){
            contexto.fillStyle = "red"
            contexto.fillRect(LARGURA / 2 - 50, ALTURA / 2 - 50, 100, 100)// cria o quadrado vermelho que indica que o jogador perdeu

            contexto.save()//mostra a pontuação no quadrado vermelho do perdeu.
            contexto.translate(LARGURA/2, ALTURA/2)
            contexto.fillStyle = "#fff"

            if(bloco.score > record){
                contexto.fillText("Novo Record!", -150, -65)//exibe o texto novo record na tela
            }else if(record < 10){
                contexto.fillText("Record " + record, - 99, -65)
            }else if(record >= 10 && record < 100){
                contexto.fillText("Record " + record, -112, -65)
            }else{
                contexto.fillText("Record " + record, -125, -65)
            }

            if(bloco.score<10){
                contexto.fillText(bloco.score, -13, 19)
            }else if(bloco.score >= 10 && bloco.score <100){
                contexto.fillText(bloco.score, -26, 19)
            }else{
                contexto.fillText(bloco.score, -39, 19)
            }
            contexto.restore()
        }
        
        else if (estadoAtual == estados.jogando){
            obstaculos.desenhar()
        }        

            chao.desenhar()
            bloco.desenhar()
        }

        main()