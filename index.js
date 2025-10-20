class TestNen {
    #img; #p; #patrones; #preguntas; #resultados; #test;
    #cargarPregunta() {
        let div = document.getElementById("test-nen-pregunta");
        div.querySelector("h2").textContent = this.#preguntas[this.#p].pregunta;
        let opciones = this.#preguntas[this.#p].opciones;
        for (let i = 0; i < 6; i++) {
            div.querySelector("form>label:nth-child(" + (i + 1) + ")>span").textContent = opciones[i].opcion;
        }
    }
    #calcularResultado() {
        let output = document.getElementById("test-nen-resultado");
        if (Object.entries(this.#test).filter(([_, v]) => v === Math.max(...Object.values(this.#test))).length > 1) {
            let diferencias = {};
            for (const campo in this.#patrones) {
                diferencias[campo] = {};
                for (const subcampo in this.#patrones[campo]) {
                    diferencias[campo][subcampo] = Math.abs(this.#patrones[campo][subcampo] - this.#test[subcampo]);
                }
                diferencias[campo] = Object.values(diferencias[campo]).reduce((a, v) => a + v, 0);
            }
            if (Object.values(diferencias).filter(v => v === Math.min(Object.values(diferencias))).length === 1) {
                let k = Object.entries(diferencias).find(([_, v]) => v === Math.min(Object.values(diferencias)))[0];
                document.getElementById("test-nen-imagen").src = this.#img[k];
                output.textContent = this.#resultados[k];
            } else {
                output.textContent = this.#resultados["defecto"];
            }
        } else {
            let ranking = Object.entries(this.#test).sort((a, b) => b[1] - a[1]);
            document.getElementById("test-nen-imagen").src = this.#img[ranking[0][0]];
            output.textContent = this.#resultados[ranking[0][0]];
        }
        output.textContent += "\nPuntuación calculada (con margen de error):";
        let ranking = Object.entries(this.#test).sort((a, b) => b[1] - a[1]);
        for (const [campo, valor] of ranking) {
            output.textContent += `\n${+(valor * 100).toFixed(1)}% ${campo}.`;
        }
    }
    comenzar() {
        this.#p = 0;
        this.#test = {
            manipulador: 0, emisor: 0, potenciador: 0,
            transmutador: 0, materializador: 0, especialista: 0
        }
        document.getElementById("test-nen-resultado").textContent = "";
        fetch("index.json").then(archivo => archivo.json())
            .then(datos => {
                this.#img = datos.img;
                this.#patrones = datos.patrones;
                this.#resultados = datos.resultados;
                this.#preguntas = datos.preguntas.sort(() => Math.random() - 0.5);
                for (let pregunta of this.#preguntas) {
                    pregunta.opciones = pregunta.opciones.sort(() => Math.random() - 0.5);
                }
                document.getElementById("test-nen-comenzar").style.display = "none";
                this.#cargarPregunta();
                document.getElementById("test-nen-imagen").src = this.#img["introducción"];
                document.getElementById("test-nen-pregunta").style.display = "block";
            });
    }
    siguiente(event) {
        event.preventDefault();
        let i = +event.target.respuesta.value;
        for (const campo in this.#test) {
            this.#test[campo] += +this.#preguntas[this.#p]["opciones"][i]["puntaje"][campo];
            this.#test[campo] = +this.#test[campo].toFixed(3);
        }
        this.#p++;
        document.getElementById("test-nen-pregunta").style.display = "none";
        if (this.#p < this.#preguntas.length) {
            this.#cargarPregunta();
            document.getElementById("test-nen-pregunta").style.display = "block";
        } else {
            this.#calcularResultado();
            document.getElementById("test-nen-comenzar").style.display = "block";
        }
    }
}
test = new TestNen();