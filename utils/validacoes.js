function somenteDigitos(valor) {
    return String(valor || '').replace(/\D/g, '');
}

function validarCpf(cpf) {
    const digitos = somenteDigitos(cpf);
    if(digitos.length !== 11 || /^(\d)\1{10}$/.test(digitos)) return false;

    let soma = 0;
    for(let i = 0; i < 9; i++) {
        soma += parseInt(digitos[i], 10) * (10 - i);
    }
    let resto = (soma * 10) % 11;
    if(resto === 10) resto = 0;
    if(resto !== parseInt(digitos[9], 10)) return false;

    soma = 0;
    for(let i = 0; i < 10; i++) {
        soma += parseInt(digitos[i], 10) * (11 - i);
    }
    resto = (soma * 10) % 11;
    if(resto === 10) resto = 0;

    return resto === parseInt(digitos[10], 10);
}

function limparCnpjAlfanumerico(cnpj) {
    return String(cnpj || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
}

function valorCnpj(caractere) {
    return caractere.charCodeAt(0) - 48;
}

function calcularDigitoCnpj(base, pesos) {
    const soma = base.split('').reduce((total, caractere, indice) => {
        return total + valorCnpj(caractere) * pesos[indice];
    }, 0);
    const resto = soma % 11;
    return resto < 2 ? 0 : 11 - resto;
}

function validarCnpj(cnpj) {
    const limpo = limparCnpjAlfanumerico(cnpj);
    if(limpo.length !== 14) return false;
    if(!/^[A-Z0-9]{12}\d{2}$/.test(limpo)) return false;
    if(/^([A-Z0-9])\1{13}$/.test(limpo)) return false;

    const base = limpo.slice(0, 12);
    const digitos = limpo.slice(12);
    const primeiro = calcularDigitoCnpj(base, [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]);
    const segundo = calcularDigitoCnpj(base + primeiro, [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]);

    return digitos === `${primeiro}${segundo}`;
}

function validarDataNascimento(dataNascimento) {
    if(!dataNascimento) return true;

    const texto = String(dataNascimento);
    if(!/^\d{4}-\d{2}-\d{2}$/.test(texto)) return false;

    const [ano, mes, dia] = texto.split('-').map(Number);
    const data = new Date(ano, mes - 1, dia);
    if(Number.isNaN(data.getTime())) return false;
    if(data.getFullYear() !== ano || data.getMonth() !== mes - 1 || data.getDate() !== dia) return false;

    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    return data.getTime() <= hoje.getTime();
}

function numeroValido(valor) {
    const numero = Number(valor);
    return Number.isFinite(numero) ? numero : null;
}

function inteiroPositivo(valor) {
    const numero = Number(valor);
    if(!Number.isInteger(numero) || numero <= 0) return null;
    return numero;
}

function inteiroNaoNegativo(valor) {
    const numero = Number(valor);
    if(!Number.isInteger(numero) || numero < 0) return null;
    return numero;
}

function dinheiroNaoNegativo(valor) {
    const numero = numeroValido(valor);
    if(numero === null || numero < 0) return null;
    return numero;
}

module.exports = {
    somenteDigitos,
    validarCpf,
    limparCnpjAlfanumerico,
    validarCnpj,
    validarDataNascimento,
    inteiroPositivo,
    inteiroNaoNegativo,
    dinheiroNaoNegativo
};
