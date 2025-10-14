"use client"

import React, { useState, useEffect, useRef } from "react"
import { X, Lock, Shield, Check, Download } from "lucide-react"
import { useCart } from "../context/CartContext"
import { useAuth } from "../context/AuthContext"
import { useStore } from "../context/StoreContext"
import jsPDF from "jspdf"

interface CheckoutModalProps {
  isOpen: boolean
  onClose: () => void
}

interface Region {
  id: string
  name: string
}

interface Province {
  id: string
  name: string
  regionId: string
}

interface District {
  id: string
  name: string
  provinceId: string
}

const REGIONS: Region[] = [
  { id: "01", name: "Amazonas" },
  { id: "02", name: "Áncash" },
  { id: "03", name: "Apurímac" },
  { id: "04", name: "Arequipa" },
  { id: "05", name: "Ayacucho" },
  { id: "06", name: "Cajamarca" },
  { id: "07", name: "Callao" },
  { id: "08", name: "Cusco" },
  { id: "09", name: "Huancavelica" },
  { id: "10", name: "Huánuco" },
  { id: "11", name: "Ica" },
  { id: "12", name: "Junín" },
  { id: "13", name: "La Libertad" },
  { id: "14", name: "Lambayeque" },
  { id: "15", name: "Lima" },
  { id: "16", name: "Loreto" },
  { id: "17", name: "Madre de Dios" },
  { id: "18", name: "Moquegua" },
  { id: "19", name: "Pasco" },
  { id: "20", name: "Piura" },
  { id: "21", name: "Puno" },
  { id: "22", name: "San Martín" },
  { id: "23", name: "Tacna" },
  { id: "24", name: "Tumbes" },
  { id: "25", name: "Ucayali" },
]

const PROVINCES: Province[] = [
  { id: "0101", name: "Chachapoyas", regionId: "01" },
  { id: "0102", name: "Bagua", regionId: "01" },
  { id: "0103", name: "Bongará", regionId: "01" },
  { id: "0104", name: "Condorcanqui", regionId: "01" },
  { id: "0105", name: "Luya", regionId: "01" },
  { id: "0106", name: "Rodríguez de Mendoza", regionId: "01" },
  { id: "0107", name: "Utcubamba", regionId: "01" },
  { id: "0201", name: "Huaraz", regionId: "02" },
  { id: "0202", name: "Aija", regionId: "02" },
  { id: "0203", name: "Antonio Raymondi", regionId: "02" },
  { id: "0204", name: "Asunción", regionId: "02" },
  { id: "0205", name: "Bolognesi", regionId: "02" },
  { id: "0206", name: "Carhuaz", regionId: "02" },
  { id: "0207", name: "Carlos F. Fitzcarrald", regionId: "02" },
  { id: "0208", name: "Casma", regionId: "02" },
  { id: "0209", name: "Corongo", regionId: "02" },
  { id: "0210", name: "Huari", regionId: "02" },
  { id: "0211", name: "Huarmey", regionId: "02" },
  { id: "0212", name: "Huaylas", regionId: "02" },
  { id: "0213", name: "Mariscal Luzuriaga", regionId: "02" },
  { id: "0214", name: "Ocros", regionId: "02" },
  { id: "0215", name: "Pallasca", regionId: "02" },
  { id: "0216", name: "Pomabamba", regionId: "02" },
  { id: "0217", name: "Recuay", regionId: "02" },
  { id: "0218", name: "Santa", regionId: "02" },
  { id: "0219", name: "Sihuas", regionId: "02" },
  { id: "0220", name: "Yungay", regionId: "02" },
  { id: "0301", name: "Abancay", regionId: "03" },
  { id: "0302", name: "Antabamba", regionId: "03" },
  { id: "0303", name: "Aymaraes", regionId: "03" },
  { id: "0304", name: "Cotabambas", regionId: "03" },
  { id: "0305", name: "Grau", regionId: "03" },
  { id: "0306", name: "Chincheros", regionId: "03" },
  { id: "0307", name: "Andahuaylas", regionId: "03" },
  { id: "0401", name: "Arequipa", regionId: "04" },
  { id: "0402", name: "Camaná", regionId: "04" },
  { id: "0403", name: "Caravelí", regionId: "04" },
  { id: "0404", name: "Castilla", regionId: "04" },
  { id: "0405", name: "Caylloma", regionId: "04" },
  { id: "0406", name: "Condesuyos", regionId: "04" },
  { id: "0407", name: "Islay", regionId: "04" },
  { id: "0408", name: "La Unión", regionId: "04" },
  { id: "0501", name: "Cangallo", regionId: "05" },
  { id: "0502", name: "Huanta", regionId: "05" },
  { id: "0503", name: "Huamanga", regionId: "05" },
  { id: "0504", name: "Huanca Sancos", regionId: "05" },
  { id: "0505", name: "La Mar", regionId: "05" },
  { id: "0506", name: "Lucanas", regionId: "05" },
  { id: "0507", name: "Parinacochas", regionId: "05" },
  { id: "0508", name: "Páucar del Sara Sara", regionId: "05" },
  { id: "0509", name: "Sucre", regionId: "05" },
  { id: "0510", name: "Víctor Fajardo", regionId: "05" },
  { id: "0511", name: "Vilcashuamán", regionId: "05" },
  { id: "0601", name: "Cajamarca", regionId: "06" },
  { id: "0602", name: "Cajabamba", regionId: "06" },
  { id: "0603", name: "Celendín", regionId: "06" },
  { id: "0604", name: "Chota", regionId: "06" },
  { id: "0605", name: "Contumazá", regionId: "06" },
  { id: "0606", name: "Cutervo", regionId: "06" },
  { id: "0607", name: "Hualgayoc", regionId: "06" },
  { id: "0608", name: "Jaén", regionId: "06" },
  { id: "0609", name: "San Ignacio", regionId: "06" },
  { id: "0610", name: "San Marcos", regionId: "06" },
  { id: "0611", name: "San Miguel", regionId: "06" },
  { id: "0612", name: "San Pablo", regionId: "06" },
  { id: "0613", name: "Santa Cruz", regionId: "06" },
  { id: "0701", name: "Callao", regionId: "07" },
  { id: "0801", name: "Cuzco", regionId: "08" },
  { id: "0802", name: "Acomayo", regionId: "08" },
  { id: "0803", name: "Anta", regionId: "08" },
  { id: "0804", name: "Calca", regionId: "08" },
  { id: "0805", name: "Canas", regionId: "08" },
  { id: "0806", name: "Canchis", regionId: "08" },
  { id: "0807", name: "Chumbivilcas", regionId: "08" },
  { id: "0808", name: "Espinar", regionId: "08" },
  { id: "0809", name: "La Convención", regionId: "08" },
  { id: "0810", name: "Paruro", regionId: "08" },
  { id: "0811", name: "Paucartambo", regionId: "08" },
  { id: "0812", name: "Quispicanchi", regionId: "08" },
  { id: "0813", name: "Urubamba", regionId: "08" },
  { id: "0901", name: "Huancavelica", regionId: "09" },
  { id: "0902", name: "Acobamba", regionId: "09" },
  { id: "0903", name: "Angaraes", regionId: "09" },
  { id: "0904", name: "Castrovirreyna", regionId: "09" },
  { id: "0905", name: "Churcampa", regionId: "09" },
  { id: "0906", name: "Huaytará", regionId: "09" },
  { id: "0907", name: "Tayacaja", regionId: "09" },
  { id: "1001", name: "Huánuco", regionId: "10" },
  { id: "1002", name: "Ambo", regionId: "10" },
  { id: "1003", name: "Dos de Mayo", regionId: "10" },
  { id: "1004", name: "Huacaybamba", regionId: "10" },
  { id: "1005", name: "Huamalíes", regionId: "10" },
  { id: "1006", name: "Leoncio Prado", regionId: "10" },
  { id: "1007", name: "Marañón", regionId: "10" },
  { id: "1008", name: "Pachitea", regionId: "10" },
  { id: "1009", name: "Puerto Inca", regionId: "10" },
  { id: "1010", name: "Lauricocha", regionId: "10" },
  { id: "1011", name: "Yarowilca", regionId: "10" },
  { id: "1101", name: "Ica", regionId: "11" },
  { id: "1102", name: "Chincha", regionId: "11" },
  { id: "1103", name: "Nazca", regionId: "11" },
  { id: "1104", name: "Palpa", regionId: "11" },
  { id: "1105", name: "Pisco", regionId: "11" },
  { id: "1201", name: "Chanchamayo", regionId: "12" },
  { id: "1202", name: "Chupaca", regionId: "12" },
  { id: "1203", name: "Concepción", regionId: "12" },
  { id: "1204", name: "Huancayo", regionId: "12" },
  { id: "1205", name: "Jauja", regionId: "12" },
  { id: "1206", name: "Junín", regionId: "12" },
  { id: "1207", name: "Satipo", regionId: "12" },
  { id: "1208", name: "Tarma", regionId: "12" },
  { id: "1209", name: "Yauli", regionId: "12" },
  { id: "1301", name: "Trujillo", regionId: "13" },
  { id: "1302", name: "Ascope", regionId: "13" },
  { id: "1303", name: "Bolívar", regionId: "13" },
  { id: "1304", name: "Chepén", regionId: "13" },
  { id: "1305", name: "Julcán", regionId: "13" },
  { id: "1306", name: "Otuzco", regionId: "13" },
  { id: "1307", name: "Gran Chimú", regionId: "13" },
  { id: "1308", name: "Pacasmayo", regionId: "13" },
  { id: "1309", name: "Pataz", regionId: "13" },
  { id: "1310", name: "Sánchez Carrión", regionId: "13" },
  { id: "1311", name: "Santiago de Chuco", regionId: "13" },
  { id: "1312", name: "Virú", regionId: "13" },
  { id: "1401", name: "Chiclayo", regionId: "14" },
  { id: "1402", name: "Ferreñafe", regionId: "14" },
  { id: "1403", name: "Lambayeque", regionId: "14" },
  { id: "1501", name: "Barranca", regionId: "15" },
  { id: "1502", name: "Cajatambo", regionId: "15" },
  { id: "1503", name: "Canta", regionId: "15" },
  { id: "1504", name: "Cañete", regionId: "15" },
  { id: "1505", name: "Huaral", regionId: "15" },
  { id: "1506", name: "Huarochirí", regionId: "15" },
  { id: "1507", name: "Huaura", regionId: "15" },
  { id: "1508", name: "Lima", regionId: "15" },
  { id: "1509", name: "Oyón", regionId: "15" },
  { id: "1510", name: "Yauyos", regionId: "15" },
  { id: "1601", name: "Maynas", regionId: "16" },
  { id: "1602", name: "Putumayo", regionId: "16" },
  { id: "1603", name: "Alto Amazonas", regionId: "16" },
  { id: "1604", name: "Loreto", regionId: "16" },
  { id: "1605", name: "Mariscal Ramón Castilla", regionId: "16" },
  { id: "1606", name: "Requena", regionId: "16" },
  { id: "1607", name: "Ucayali", regionId: "16" },
  { id: "1608", name: "Datem del Marañón", regionId: "16" },
  { id: "1701", name: "Tambopata", regionId: "17" },
  { id: "1702", name: "Manu", regionId: "17" },
  { id: "1703", name: "Tahuamanu", regionId: "17" },
  { id: "1801", name: "Mariscal Nieto", regionId: "18" },
  { id: "1802", name: "General Sánchez Cerro", regionId: "18" },
  { id: "1803", name: "Ilo", regionId: "18" },
  { id: "1901", name: "Pasco", regionId: "19" },
  { id: "1902", name: "Oxapampa", regionId: "19" },
  { id: "1903", name: "Daniel A. Carrión", regionId: "19" },
  { id: "2001", name: "Ayabaca", regionId: "20" },
  { id: "2002", name: "Huancabamba", regionId: "20" },
  { id: "2003", name: "Morropón", regionId: "20" },
  { id: "2004", name: "Piura", regionId: "20" },
  { id: "2005", name: "Sechura", regionId: "20" },
  { id: "2006", name: "Sullana", regionId: "20" },
  { id: "2007", name: "Paita", regionId: "20" },
  { id: "2008", name: "Talara", regionId: "20" },
  { id: "2101", name: "San Román", regionId: "21" },
  { id: "2102", name: "Puno", regionId: "21" },
  { id: "2103", name: "Azángaro", regionId: "21" },
  { id: "2104", name: "Chucuito", regionId: "21" },
  { id: "2105", name: "El Collao", regionId: "21" },
  { id: "2106", name: "Melgar", regionId: "21" },
  { id: "2107", name: "Carabaya", regionId: "21" },
  { id: "2108", name: "Huancané", regionId: "21" },
  { id: "2109", name: "Sandia", regionId: "21" },
  { id: "2110", name: "San Antonio de Putina", regionId: "21" },
  { id: "2111", name: "Lampa", regionId: "21" },
  { id: "2112", name: "Yunguyo", regionId: "21" },
  { id: "2113", name: "Moho", regionId: "21" },
  { id: "2201", name: "Bellavista", regionId: "22" },
  { id: "2202", name: "El Dorado", regionId: "22" },
  { id: "2203", name: "Huallaga", regionId: "22" },
  { id: "2204", name: "Lamas", regionId: "22" },
  { id: "2205", name: "Mariscal Cáceres", regionId: "22" },
  { id: "2206", name: "Moyobamba", regionId: "22" },
  { id: "2207", name: "Picota", regionId: "22" },
  { id: "2208", name: "Rioja", regionId: "22" },
  { id: "2209", name: "San Martín", regionId: "22" },
  { id: "2210", name: "Tocache", regionId: "22" },
  { id: "2301", name: "Tacna", regionId: "23" },
  { id: "2302", name: "Candarave", regionId: "23" },
  { id: "2303", name: "Jorge Basadre", regionId: "23" },
  { id: "2304", name: "Tarata", regionId: "23" },
  { id: "2401", name: "Tumbes", regionId: "24" },
  { id: "2402", name: "Zarumilla", regionId: "24" },
  { id: "2403", name: "Contralmirante Villar", regionId: "24" },
  { id: "2501", name: "Coronel Portillo", regionId: "25" },
  { id: "2502", name: "Atalaya", regionId: "25" },
  { id: "2503", name: "Padre Abad", regionId: "25" },
  { id: "2504", name: "Purús", regionId: "25" },
]

const DISTRICTS: District[] = [
  { id: "010101", name: "Chachapoyas", provinceId: "0101" },
  { id: "010102", name: "Asunción", provinceId: "0101" },
  { id: "010103", name: "Balsas", provinceId: "0101" },
  { id: "010104", name: "Cheto", provinceId: "0101" },
  { id: "010105", name: "Chiliquín", provinceId: "0101" },
  { id: "010106", name: "Chuquian", provinceId: "0101" },
  { id: "010107", name: "Granada", provinceId: "0101" },
  { id: "010108", name: "Huancas", provinceId: "0101" },
  { id: "010109", name: "La Jalca", provinceId: "0101" },
  { id: "010110", name: "Leimebamba", provinceId: "0101" },
  { id: "010111", name: "Levanto", provinceId: "0101" },
  { id: "010112", name: "Magdalena", provinceId: "0101" },
  { id: "010113", name: "Mariscal Cáceres", provinceId: "0101" },
  { id: "010114", name: "Mollepata", provinceId: "0101" },
  { id: "010115", name: "Olleros", provinceId: "0101" },
  { id: "010116", name: "San Francisco de la Jalca", provinceId: "0101" },
  { id: "010117", name: "San Isidro del Maino", provinceId: "0101" },
  { id: "010118", name: "Soloco", provinceId: "0101" },
  { id: "010119", name: "Sonche", provinceId: "0101" },
  { id: "010201", name: "Bagua", provinceId: "0102" },
  { id: "010202", name: "Arangües", provinceId: "0102" },
  { id: "010203", name: "Copallín", provinceId: "0102" },
  { id: "010204", name: "Imaza", provinceId: "0102" },
  { id: "010205", name: "La Peca", provinceId: "0102" },
  { id: "010206", name: "Bagua Grande", provinceId: "0102" },
  { id: "060301", name: "Baños del Inca", provinceId: "0603" },
  { id: "150101", name: "Barranca", provinceId: "1501" },
  { id: "150801", name: "Barranco", provinceId: "1508" },
  { id: "220101", name: "Bellavista", provinceId: "2201" },
  { id: "200301", name: "Bellavista de la Unión", provinceId: "2003" },
  { id: "060401", name: "Bellavista (Jaén)", provinceId: "0604" },
  { id: "060302", name: "Bambamarca", provinceId: "0603" },
  { id: "020501", name: "Bolognesi", provinceId: "0205" },
  { id: "021501", name: "Bolognesi (Pallasca)", provinceId: "0215" },
  { id: "200401", name: "Buenos Aires", provinceId: "2004" },
  { id: "200302", name: "Buenos Aires (Morropón)", provinceId: "2003" },
  { id: "140201", name: "Buenos Aires (Ferreñafe)", provinceId: "1402" },
  { id: "020101", name: "Cabana", provinceId: "0201" },
  { id: "050201", name: "Cabana Sur", provinceId: "0502" },
  { id: "040301", name: "Cabanaconde", provinceId: "0403" },
  { id: "240301", name: "Cabuyal", provinceId: "2403" },
  { id: "060102", name: "Cachachi", provinceId: "0601" },
  { id: "080101", name: "Cachimayo", provinceId: "0801" },
  { id: "150602", name: "Cacra", provinceId: "1506" },
  { id: "060201", name: "Cajabamba", provinceId: "0602" },
  { id: "060101", name: "Cajamarca", provinceId: "0601" },
  { id: "010301", name: "Cajaruro", provinceId: "0103" },
  { id: "080401", name: "Calca", provinceId: "0804" },
  { id: "150603", name: "Callahuanca", provinceId: "1506" },
  { id: "070101", name: "Callao", provinceId: "0701" },
  { id: "060103", name: "Calquis", provinceId: "0601" },
  { id: "040201", name: "Camana", provinceId: "0402" },
  { id: "230401", name: "Camilaca", provinceId: "2304" },
  { id: "140301", name: "Cañaris", provinceId: "1403" },
  { id: "150404", name: "Cañete", provinceId: "1504" },
  { id: "150805", name: "Carabayllo", provinceId: "1508" },
  { id: "210701", name: "Caracoto", provinceId: "2107" },
  { id: "020601", name: "Caraz", provinceId: "0206" },
  { id: "070102", name: "Carmen de la Legua Reynoso", provinceId: "0701" },
  { id: "050301", name: "Carmen Alto", provinceId: "0503" },
  { id: "130501", name: "Cascas", provinceId: "1305" },
  { id: "200401", name: "Castilla", provinceId: "2004" },
  { id: "200402", name: "Catacaos", provinceId: "2004" },
  { id: "140102", name: "Cayaltí", provinceId: "1401" },
  { id: "040502", name: "Cayma", provinceId: "0405" },
  { id: "060401", name: "Chota", provinceId: "0604" },
  { id: "120201", name: "Chupaca", provinceId: "1202" },
  { id: "150806", name: "Cieneguilla", provinceId: "1508" },
  { id: "210401", name: "Coata", provinceId: "2104" },
  { id: "150405", name: "Coayllo", provinceId: "1504" },
  { id: "150807", name: "Comas", provinceId: "1508" },
  { id: "120301", name: "Concepción", provinceId: "1203" },
  { id: "060501", name: "Condebamba", provinceId: "0605" },
  { id: "010401", name: "Condorcanqui", provinceId: "0104" },
  { id: "050601", name: "Coracora", provinceId: "0506" },
  { id: "230301", name: "Coronel Gregorio Albarracín", provinceId: "2303" },
  { id: "090201", name: "Cosme", provinceId: "0902" },
  { id: "010501", name: "Cumba", provinceId: "0105" },
  { id: "080101", name: "Cusco", provinceId: "0801" },
  { id: "060601", name: "Cutervo", provinceId: "0606" },
  { id: "100101", name: "Daniel Alomía Robles", provinceId: "1001" },
  { id: "120401", name: "Daniel Hernández", provinceId: "1204" },
  { id: "040101", name: "Dean Valdivia", provinceId: "0401" },
  { id: "210801", name: "Desaguadero", provinceId: "2108" },
  { id: "240201", name: "Doce de Octubre", provinceId: "2402" },
  { id: "080901", name: "Echarate", provinceId: "0809" },
  { id: "150808", name: "El Agustino", provinceId: "1508" },
  { id: "200501", name: "El Alto", provinceId: "2005" },
  { id: "110101", name: "El Carmen", provinceId: "1101" },
  { id: "210501", name: "El Collao", provinceId: "2105" },
  { id: "130101", name: "El Porvenir", provinceId: "1301" },
  { id: "120801", name: "El Tambo", provinceId: "1208" },
  { id: "140301", name: "Eten", provinceId: "1403" },
  { id: "140302", name: "Eten Puerto", provinceId: "1403" },
  { id: "140201", name: "Ferreñafe", provinceId: "1402" },
  { id: "140203", name: "Ferrenafe Pueblo Nuevo", provinceId: "1402" },
  { id: "060902", name: "Frontera", provinceId: "0609" },
  { id: "230301", name: "Gregorio Albarracín", provinceId: "2303" },
  { id: "110301", name: "Grocio Prado", provinceId: "1103" },
  { id: "130601", name: "Guadalupe", provinceId: "1306" },
  { id: "130101", name: "Huanchaco", provinceId: "1301" },
  { id: "020101", name: "Huaraz", provinceId: "0201" },
  { id: "160101", name: "Iquitos", provinceId: "1601" },
  { id: "150809", name: "Independencia", provinceId: "1508" },
  { id: "060801", name: "Jaén", provinceId: "0608" },
  { id: "150810", name: "Jesús María", provinceId: "1508" },
  { id: "080701", name: "Kimbiri", provinceId: "0807" },
  { id: "150811", name: "Lince", provinceId: "1508" },
  { id: "150812", name: "Lurín", provinceId: "1508" },
  { id: "150813", name: "Miraflores", provinceId: "1508" },
  { id: "180101", name: "Moquegua", provinceId: "1801" },
  { id: "110301", name: "Nazca", provinceId: "1103" },
  { id: "020801", name: "Nuevo Chimbote", provinceId: "0208" },
  { id: "081001", name: "Ollantaytambo", provinceId: "0810" },
  { id: "040601", name: "Ocoña", provinceId: "0406" },
  { id: "200401", name: "Piura", provinceId: "2004" },
  { id: "250101", name: "Pucallpa", provinceId: "2501" },
  { id: "080901", name: "Quillabamba", provinceId: "0809" },
  { id: "060901", name: "Querocoto", provinceId: "0609" },
  { id: "150814", name: "Rímac", provinceId: "1508" },
  { id: "021701", name: "Recuay", provinceId: "0217" },
  { id: "150815", name: "San Isidro", provinceId: "1508" },
  { id: "150816", name: "Santiago de Surco", provinceId: "1508" },
  { id: "230101", name: "Tacna", provinceId: "2301" },
  { id: "170101", name: "Tambopata", provinceId: "1701" },
  { id: "081301", name: "Urubamba", provinceId: "0813" },
  { id: "160701", name: "Ucayali", provinceId: "1607" },
  { id: "150817", name: "Villa El Salvador", provinceId: "1508" },
  { id: "131201", name: "Virú", provinceId: "1312" },
  { id: "250101", name: "Yarinacocha", provinceId: "2501" },
  { id: "040501", name: "Yanahuara", provinceId: "0405" },
  { id: "240201", name: "Zarumilla", provinceId: "2402" },
  { id: "140301", name: "Zaña", provinceId: "1403" },
]

export const CheckoutModal: React.FC<CheckoutModalProps> = ({ isOpen, onClose }) => {
  const { items, getTotalPrice, clearCart } = useCart()
  const { user } = useAuth()
  const { addOrder } = useStore()

  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState({
    fullName: "",
    dni: "",
    email: "",
    phone: "",
    region: "",
    province: "",
    district: "",
    addressDetails: "",
    paymentMethod: "",
    cardType: "",
    cardNumber: "",
    cardExpiry: "",
    cardCvv: "",
  })
  const [paymentProof, setPaymentProof] = useState<File | null>(null)
  const [provinces, setProvinces] = useState<Province[]>([])
  const [districts, setDistricts] = useState<District[]>([])
  const [isConfirmed, setIsConfirmed] = useState(false)
  const [completedSteps, setCompletedSteps] = useState<number[]>([])
  const formRef = useRef<HTMLDivElement>(null)

  const handleClose = () => {
    setFormData({
      fullName: "",
      dni: "",
      email: "",
      phone: "",
      region: "",
      province: "",
      district: "",
      addressDetails: "",
      paymentMethod: "",
      cardType: "",
      cardNumber: "",
      cardExpiry: "",
      cardCvv: "",
    })
    setPaymentProof(null)
    setCurrentStep(1)
    setCompletedSteps([])
    setIsConfirmed(false)
    onClose()
  }

  useEffect(() => {
    if (formData.region) {
      setProvinces(PROVINCES.filter((p) => p.regionId === formData.region))
      setFormData((prev) => ({ ...prev, province: "", district: "" }))
      setDistricts([])
    }
  }, [formData.region])

  useEffect(() => {
    if (formData.province) {
      setDistricts(DISTRICTS.filter((d) => d.provinceId === formData.province))
      setFormData((prev) => ({ ...prev, district: "" }))
    }
  }, [formData.province])

  if (!isOpen) return null

  const subtotal = getTotalPrice()
  const shipping = 15.0
  const total = subtotal + shipping

  const steps = [
    { number: 1, title: "Información" },
    { number: 2, title: "Ubicación" },
    { number: 3, title: "Pago" },
    { number: 4, title: "Confirmación" },
  ]

  const validateStep1 = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    const phoneRegex = /^[0-9-]{1,9}$/
    const dniRegex = /^\d{8}$/

    if (!formData.fullName.trim()) {
      alert("El Nombre Completo es obligatorio.")
      return false
    }
    if (!dniRegex.test(formData.dni)) {
      alert("El DNI debe contener exactamente 8 dígitos numéricos.")
      return false
    }
    if (!emailRegex.test(formData.email)) {
      alert("Por favor, ingrese un correo electrónico válido (ej. usuario@dominio.com).")
      return false
    }
    if (!phoneRegex.test(formData.phone) || formData.phone.length > 9) {
      alert("El Teléfono debe contener máximo 9 caracteres, solo números y guiones.")
      return false
    }
    return true
  }

  const validateStep3 = () => {
    const cardNumberRegex = /^\d{16}$/
    const cardExpiryRegex = /^(0[1-9]|1[0-2])\/([0-9]{2})$/
    const cardCvvRegex = /^\d{3,4}$/

    if (!formData.paymentMethod) {
      alert("Por favor, selecciona un método de pago.")
      return false
    }
    if (formData.paymentMethod === "card") {
      if (!formData.cardType) {
        alert("Por favor, selecciona un tipo de tarjeta.")
        return false
      }
      if (!cardNumberRegex.test(formData.cardNumber.replace(/\s/g, ""))) {
        alert("El Número de Tarjeta debe contener exactamente 16 dígitos numéricos.")
        return false
      }
      if (!cardExpiryRegex.test(formData.cardExpiry)) {
        alert("La Fecha de Expiración debe tener el formato MM/AA.")
        return false
      }
      if (!cardCvvRegex.test(formData.cardCvv)) {
        alert("El CVV debe contener 3 o 4 dígitos numéricos.")
        return false
      }
    }
    return true
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handlePaymentMethodSelect = (method: string) => {
    setFormData((prev) => ({
      ...prev,
      paymentMethod: method,
      cardNumber: "",
      cardExpiry: "",
      cardCvv: "",
    }))
  }

  const handleContinue = () => {
    if (currentStep === 1) {
      if (!validateStep1()) return
    }
    if (currentStep === 2 && (!formData.region || !formData.province || !formData.district)) {
      alert("Por favor, completa todos los campos requeridos en Ubicación.")
      return
    }
    if (currentStep === 3 && !validateStep3()) {
      return
    }
    if (currentStep < 4) {
      setCompletedSteps((prev) => [...prev, currentStep])
      setCurrentStep(currentStep + 1)
    }
  }

  const handleConfirm = () => {
    if (!user) {
      alert("Debes iniciar sesión para confirmar el pedido")
      return
    }
    if (!paymentProof) {
      alert("Por favor, sube un comprobante de pago antes de confirmar.")
      return
    }

    const order = {
      customer: {
        name: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        address: fullAddress,
        dni: formData.dni,
      },
      items: items.map((item) => ({
        product: item,
        quantity: item.quantity,
      })),
      total: total,
      status: "pending" as const,
      paymentProof: paymentProof.name,
    }

    addOrder(order)
    setIsConfirmed(true)
    setCompletedSteps((prev) => [...prev, 4])
    clearCart()
    alert("¡Pedido confirmado exitosamente! Ahora puedes descargar el comprobante.")
  }

  const handleDownloadReceipt = () => {
    const doc = new jsPDF()
    const logoUrl = "../assets/images/s-r.png"
    const pageWidth = doc.internal.pageSize.getWidth()
    let y = 15

    // Adding logo
    doc.addImage(logoUrl, "PNG", (pageWidth - 50) / 2, y, 50, 25)
    y += 35

    // Title
    doc.setFont("helvetica", "bold")
    doc.setFontSize(16)
    doc.text("Comprobante de Pago", pageWidth / 2, y, { align: "center" })
    y += 10

    // Separator
    doc.setLineWidth(0.5)
    doc.line(20, y, pageWidth - 20, y)
    y += 10

    // Customer Information
    doc.setFont("helvetica", "normal")
    doc.setFontSize(12)
    doc.text(`Nombre: ${formData.fullName}`, 20, y)
    y += 8
    doc.text(`DNI: ${formData.dni}`, 20, y)
    y += 8
    doc.text(`Email: ${formData.email}`, 20, y)
    y += 8
    doc.text(`Teléfono: ${formData.phone}`, 20, y)
    y += 8
    doc.text(
      `Dirección: ${formData.district}, ${formData.province}, ${formData.region}${formData.addressDetails ? ` - ${formData.addressDetails}` : ""}`,
      20,
      y,
      { maxWidth: pageWidth - 40 }
    )
    y += 12
    doc.text(`Método de Pago: Tarjeta (${formData.cardType})`, 20, y)
    y += 8
    doc.text(`Comprobante de Pago: ${paymentProof?.name || "No subido"}`, 20, y)
    y += 10

    // Separator
    doc.setLineWidth(0.3)
    doc.line(20, y, pageWidth - 20, y)
    y += 10

    // Products Section
    doc.setFont("helvetica", "bold")
    doc.setFontSize(14)
    doc.text("Productos Comprados", 20, y)
    y += 8
    doc.setFont("helvetica", "normal")
    doc.setFontSize(10)
    items.forEach((item, index) => {
      const productText = `${index + 1}. ${item.name} (x${item.quantity}) - S/ ${item.price.toFixed(2)} c/u - Subtotal: S/ ${(item.price * item.quantity).toFixed(2)}`
      const splitText = doc.splitTextToSize(productText, pageWidth - 40)
      doc.text(splitText, 20, y)
      y += splitText.length * 6
    })
    y += 5

    // Separator
    doc.setLineWidth(0.3)
    doc.line(20, y, pageWidth - 20, y)
    y += 10

    // Summary
    doc.setFont("helvetica", "normal")
    doc.setFontSize(12)
    doc.text(`Subtotal: S/ ${subtotal.toFixed(2)}`, 20, y)
    y += 8
    doc.text(`Envío: S/ ${shipping.toFixed(2)}`, 20, y)
    y += 8
    doc.setFont("helvetica", "bold")
    doc.text(`Total: S/ ${total.toFixed(2)}`, 20, y)
    y += 8
    doc.setFont("helvetica", "normal")
    doc.text(`Fecha: ${new Date().toLocaleString()}`, 20, y)
    y += 10

    // Separator
    doc.setLineWidth(0.5)
    doc.line(20, y, pageWidth - 20, y)
    y += 10

    // Footer
    doc.setFont("helvetica", "italic")
    doc.setFontSize(10)
    doc.text("Gracias por tu compra!", pageWidth / 2, y, { align: "center" })

    // Save PDF
    doc.save(`comprobante_pago_${formData.dni}.pdf`)
  }

  const fullAddress = `${formData.district}, ${formData.province}, ${formData.region}${formData.addressDetails ? ` - ${formData.addressDetails}` : ""}`

  const cardIcons: { [key: string]: string } = {
    bcp: "../assets/images/bcp.png",
    interbank: "../assets/images/interb.png",
    visa: "../assets/images/visa.png",
    paypal: "../assets/images/peypal.png",
  }

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-gray-900/50 backdrop-blur-sm flex items-center justify-center">
      <div className="w-full max-w-4xl mx-4 md:mx-8 bg-gradient-to-b from-white to-green-50 dark:from-gray-900 dark:to-green-900/20 rounded-3xl shadow-xl overflow-hidden flex flex-col font-sans">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-green-50 to-white dark:from-gray-800 dark:to-gray-900">
          <div className="flex items-center gap-3">
            <Lock className="h-6 w-6 text-green-500" />
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Checkout Seguro</h2>
          </div>
          <button
            onClick={handleClose}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200"
          >
            <X className="h-6 w-6 text-gray-600 dark:text-gray-300" />
          </button>
        </div>
        <div className="flex items-center justify-center gap-2 p-4 bg-gray-50 dark:bg-gray-800">
          {steps.map((step, index) => (
            <React.Fragment key={step.number}>
              <div className="flex flex-col items-center gap-2">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 ${
                    completedSteps.includes(step.number) || (step.number === 4 && isConfirmed)
                      ? "bg-green-500 text-white"
                      : step.number === currentStep
                        ? "bg-green-500 text-white"
                        : "bg-red-500 text-white"
                  }`}
                >
                  {completedSteps.includes(step.number) || (step.number === 4 && isConfirmed) ? (
                    <Check className="h-5 w-5" />
                  ) : (
                    step.number
                  )}
                </div>
                {!completedSteps.includes(step.number) && !(step.number === 4 && isConfirmed) && (
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{step.title}</span>
                )}
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`w-12 h-1 transition-all duration-300 ${
                    completedSteps.includes(step.number) ? "bg-green-500" : "bg-gray-200 dark:bg-gray-700"
                  }`}
                />
              )}
            </React.Fragment>
          ))}
        </div>
        <div className="flex flex-1 overflow-hidden">
          <div ref={formRef} className="flex-1 p-4 md:p-6 overflow-y-auto max-h-[calc(100vh-200px)]">
            {currentStep === 1 && (
              <div className="space-y-6 max-w-lg mx-auto">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Información Personal</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Nombre Completo *
                    </label>
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white transition-colors duration-200"
                      placeholder="Admin Sr. Robot"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">DNI *</label>
                    <input
                      type="text"
                      name="dni"
                      value={formData.dni}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white transition-colors duration-200"
                      placeholder="12345678"
                      maxLength={8}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email *</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white transition-colors duration-200"
                      placeholder="admin@srrobot.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Teléfono *
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white transition-colors duration-200"
                      placeholder="999999999"
                      maxLength={9}
                    />
                  </div>
                </div>
                <button
                  onClick={handleContinue}
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2 rounded-lg transition-colors duration-200"
                >
                  Continuar a Ubicación
                </button>
              </div>
            )}
            {currentStep === 2 && (
              <div className="space-y-6 max-w-lg mx-auto">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Ubicación</h3>
                <div className="space-y-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Ubicación *</label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Región</label>
                      <select
                        name="region"
                        value={formData.region}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white transition-colors duration-200"
                      >
                        <option value="">Seleccionar región</option>
                        {REGIONS.map((reg) => (
                          <option key={reg.id} value={reg.id}>
                            {reg.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                        Provincia
                      </label>
                      <select
                        name="province"
                        value={formData.province}
                        onChange={handleInputChange}
                        disabled={!formData.region}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-700 transition-colors duration-200"
                      >
                        <option value="">Seleccionar provincia</option>
                        {provinces.map((prov) => (
                          <option key={prov.id} value={prov.id}>
                            {prov.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                        Distrito
                      </label>
                      <select
                        name="district"
                        value={formData.district}
                        onChange={handleInputChange}
                        disabled={!formData.province}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-700 transition-colors duration-200"
                      >
                        <option value="">Seleccionar distrito</option>
                        {districts.map((dist) => (
                          <option key={dist.id} value={dist.name}>
                            {dist.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                      Detalles adicionales (opcional)
                    </label>
                    <textarea
                      name="addressDetails"
                      value={formData.addressDetails}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white transition-colors duration-200"
                      placeholder="Calle, número, referencia, etc."
                    />
                  </div>
                  {fullAddress && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">Dirección: {fullAddress}</p>
                  )}
                </div>
                <button
                  onClick={handleContinue}
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2 rounded-lg transition-colors duration-200"
                >
                  Continuar al Pago
                </button>
              </div>
            )}
            {currentStep === 3 && (
              <div className="space-y-6 max-w-lg mx-auto">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Método de Pago</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Seleccionar método de pago *
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {["bcp", "interbank", "visa", "paypal"].map((card) => (
                        <button
                          key={card}
                          onClick={() => {
                            handlePaymentMethodSelect("card")
                            setFormData((prev) => ({ ...prev, cardType: card }))
                          }}
                          className={`p-3 border rounded-lg text-center flex items-center justify-center gap-2 transition-all duration-200 ${
                            formData.paymentMethod === "card" && formData.cardType === card
                              ? "border-green-500 bg-green-50 dark:bg-green-900/20"
                              : "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
                          }`}
                        >
                          <img src={cardIcons[card] || "/placeholder.svg"} alt={card} className="h-5 w-5" />
                          <span className="text-sm font-medium text-gray-900 dark:text-white capitalize">{card}</span>
                          {formData.paymentMethod === "card" && formData.cardType === card && (
                            <Check className="h-4 w-4 text-green-500" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                  {formData.paymentMethod === "card" && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Tipo de Tarjeta *
                        </label>
                        <select
                          name="cardType"
                          value={formData.cardType}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white transition-colors duration-200"
                        >
                          <option value="">Seleccionar tarjeta</option>
                          <option value="bcp">BCP</option>
                          <option value="interbank">Interbank</option>
                          <option value="visa">Visa</option>
                          <option value="paypal">PayPal</option>
                        </select>
                      </div>
                      {formData.cardType && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                              Número de Tarjeta *
                            </label>
                            <input
                              type="text"
                              name="cardNumber"
                              value={formData.cardNumber}
                              onChange={handleInputChange}
                              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white transition-colors duration-200"
                              placeholder="1234 5678 9012 3456"
                              maxLength={19}
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                              MM/AA *
                            </label>
                            <input
                              type="text"
                              name="cardExpiry"
                              value={formData.cardExpiry}
                              onChange={handleInputChange}
                              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white transition-colors duration-200"
                              placeholder="MM/AA"
                              maxLength={5}
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                              CVV *
                            </label>
                            <input
                              type="text"
                              name="cardCvv"
                              value={formData.cardCvv}
                              onChange={handleInputChange}
                              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white transition-colors duration-200"
                              placeholder="123"
                              maxLength={4}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
                <button
                  onClick={handleContinue}
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2 rounded-lg transition-colors duration-200"
                >
                  Confirmar Pago
                </button>
              </div>
            )}
            {currentStep === 4 && (
              <div className="space-y-6 max-w-lg mx-auto">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Confirmación</h3>
                <div className="text-center space-y-6 bg-gradient-to-b from-white to-green-50 dark:from-gray-800 dark:to-green-900/20 rounded-2xl p-6 shadow-lg">
                  <Check className="w-12 h-12 text-green-500 mx-auto" />
                  <p className="text-base font-medium text-gray-900 dark:text-white">
                    ¡Tu pedido está listo para confirmar!
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Por favor, revisa los detalles de tu compra y sube el comprobante de pago.
                  </p>
                  <div className="space-y-3">
                    <h4 className="text-base font-semibold text-gray-900 dark:text-white">Resumen de la Compra</h4>
                    <div className="text-left text-sm text-gray-600 dark:text-gray-400 space-y-2 bg-white dark:bg-gray-700 p-4 rounded-lg shadow-inner">
                      <p>
                        <strong>Nombre:</strong> {formData.fullName}
                      </p>
                      <p>
                        <strong>DNI:</strong> {formData.dni}
                      </p>
                      <p>
                        <strong>Email:</strong> {formData.email}
                      </p>
                      <p>
                        <strong>Teléfono:</strong> {formData.phone}
                      </p>
                      <p>
                        <strong>Dirección:</strong> {fullAddress}
                      </p>
                      <p>
                        <strong>Método de Pago:</strong> Tarjeta ({formData.cardType})
                      </p>
                      <p>
                        <strong>Comprobante de Pago:</strong> {paymentProof ? paymentProof.name : "No subido"}
                      </p>
                      <div>
                        <strong>Productos:</strong>
                        <ul className="list-disc pl-5 mt-1">
                          {items.map((item, index) => (
                            <li key={index}>
                              {item.name} (x{item.quantity}) - S/ {item.price.toFixed(2)} c/u - Subtotal: S/{" "}
                              {(item.price * item.quantity).toFixed(2)}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <p>
                        <strong>Subtotal:</strong> S/ {subtotal.toFixed(2)}
                      </p>
                      <p>
                        <strong>Envío:</strong> S/ {shipping.toFixed(2)}
                      </p>
                      <p>
                        <strong>Total:</strong> S/ {total.toFixed(2)}
                      </p>
                      <p>
                        <strong>Fecha:</strong> {new Date().toLocaleString()}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Subir Comprobante de Pago *
                        </label>
                        <input
                          type="file"
                          accept="image/*,application/pdf"
                          onChange={(e) => setPaymentProof(e.target.files?.[0] || null)}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                        />
                      </div>
                      {!isConfirmed && (
                        <button
                          onClick={handleConfirm}
                          disabled={!paymentProof}
                          className={`w-full bg-gradient-to-r from-green-600 to-white dark:from-green-700 dark:to-gray-900 border border-green-300 dark:border-green-500 hover:from-green-700 hover:to-gray-100 dark:hover:from-green-800 dark:hover:to-gray-800 text-black dark:text-white font-medium py-2 rounded-lg transition-colors duration-200 flex items-center justify-center ${
                            !paymentProof ? "opacity-50 cursor-not-allowed" : ""
                          }`}
                        >
                          <Check className="h-4 w-4 mr-2" />
                          Confirmar Pedido
                        </button>
                      )}
                      {isConfirmed && (
                        <>
                          <button
                            onClick={handleDownloadReceipt}
                            className="w-full bg-gradient-to-r from-green-600 to-white dark:from-green-700 dark:to-gray-900 border border-green-300 dark:border-green-500 hover:from-green-700 hover:to-gray-100 dark:hover:from-green-800 dark:hover:to-gray-800 text-black dark:text-white font-medium py-2 rounded-lg transition-colors duration-200 flex items-center justify-center"
                          >
                            <Download className="h-4 w-4 mr-2" />
                            Descargar Comprobante
                          </button>
                          <button
                            onClick={handleClose}
                            className="w-full bg-gradient-to-r from-green-600 to-white dark:from-green-700 dark:to-gray-900 border border-green-300 dark:border-green-500 hover:from-green-700 hover:to-gray-100 dark:hover:from-green-800 dark:hover:to-gray-800 text-black dark:text-white font-medium py-2 rounded-lg transition-colors duration-200"
                          >
                            Cerrar
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
          <div className="w-72 bg-gray-50 dark:bg-gray-800 p-4 md:p-6 border-l border-gray-200 dark:border-gray-700">
            <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4">Resumen del Pedido</h3>
            <div className="space-y-3 mb-4">
              {items.map((item) => (
                <div key={item.id} className="flex items-center gap-2">
                  <img
                    src={item.image || "https://th.bing.com/th/id/R.875bb47d2937a7c1320b7bd41fad3ec4?rik=wpsmsOzA7blZfA&pid=ImgRaw&r=0"}
                    alt={item.name}
                    className="w-10 h-10 object-cover rounded-lg"
                  />
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 dark:text-white text-sm">{item.name}</h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Cantidad: {item.quantity}</p>
                  </div>
                  <span className="font-bold text-gray-900 dark:text-white text-sm">
                    S/ {(item.price * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
            <div className="space-y-2 border-t border-gray-200 dark:border-gray-600 pt-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Subtotal:</span>
                <span className="font-medium">S/ {subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Envío:</span>
                <span className="font-medium">S/ {shipping.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-base font-bold border-t border-gray-200 dark:border-gray-600 pt-2">
                <span>Total:</span>
                <span className="text-green-600">S/ {total.toFixed(2)}</span>
              </div>
            </div>
            <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <Shield className="h-4 w-4 text-green-500" />
                <span className="text-sm font-medium text-green-700 dark:text-green-400">
                  Pago 100% seguro y encriptado
                </span>
              </div>
              <p className="text-xs text-green-600 dark:text-green-400">
                Aceptamos todas las tarjetas principales y métodos de pago locales.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}