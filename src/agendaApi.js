import { collection, doc, getDoc, getDocs, query, where, runTransaction, serverTimestamp, Timestamp } from 'firebase/firestore';
import { db, auth } from './fireBaseConfig';
import { criarAgendaStore } from './agendaStore';
const sdk = { collection, doc, getDoc, getDocs, query, where, runTransaction, serverTimestamp, Timestamp };
const store = () => criarAgendaStore(db, auth.currentUser?.uid, sdk);
export const prepararAgendaBarbeiro = () => store().prepararAgenda();
export const consultarOcupacao = (barbeiroId, data) => store().consultarOcupacao(barbeiroId, data);
export const alterarAgendamento = dados => store().alterarAgendamento(dados);
