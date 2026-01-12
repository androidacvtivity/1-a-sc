SELECT
--  C.CODUL AS CUATM,
--  C.FULL_CODE,
--  C.DENUMIRE AS CUATM_DENUMIRE,
  D.DENUMIRE,
--  D.ORDINE,
  D.RIND
FROM  CIS2.MD_RIND_OUT D
--(
--SELECT 'TOTAL' AS DENUMIRE,                                      '100'   AS ORDINE, '101-102-103-104-105-106-107-108-109-110-111-112-113.1-113.2-113.3-113.4-113.5' AS RIND FROM DUAL UNION
--SELECT 'Hoteluri si moteluri' AS DENUMIRE,                       '100.1' AS ORDINE, '101-102-103'  AS RIND FROM DUAL UNION
--SELECT 'Hoteluri' AS DENUMIRE,                                   '101'   AS ORDINE, '101' AS RIND FROM DUAL UNION
--SELECT 'Hoteluri de tip apartament' AS DENUMIRE,                 '102'   AS ORDINE, '102' AS RIND FROM DUAL UNION
--SELECT 'Moteluri' AS DENUMIRE,                                   '103'   AS ORDINE, '103' AS RIND FROM DUAL UNION
--SELECT 'Camine pentru vizitatori' AS DENUMIRE,                   '104' AS ORDINE,   '113.4' AS RIND FROM DUAL UNION
--SELECT 'Pensiuni turistice si agroturistice - total' AS DENUMIRE,'105' AS ORDINE,   '106-107' AS RIND FROM DUAL UNION  
--SELECT 'Pensiuni turistice.' AS DENUMIRE,                        '106'   AS ORDINE, '106' AS RIND FROM DUAL UNION  
--SELECT 'Pensiuni agroturistice.' AS DENUMIRE,                    '107'   AS ORDINE, '107' AS RIND FROM DUAL UNION  
--
--SELECT 'Structuri de intremare' AS DENUMIRE,                     '108'   AS ORDINE, '113.1-113.2-113.3' AS RIND FROM DUAL UNION 
--SELECT 'Sanatorii'              AS DENUMIRE,                     '109' AS ORDINE,   '113.1'  AS RIND FROM DUAL UNION 
--SELECT 'Pensiuni  de tratament' AS DENUMIRE,                     '110' AS ORDINE,   '113.2'  AS RIND FROM DUAL UNION 
--SELECT 'Alte structiri de intremare' AS DENUMIRE,                '111' AS ORDINE,   '113.3'  AS RIND FROM DUAL UNION
--SELECT 'Structuri de odihna' AS DENUMIRE,                        '112'   AS ORDINE, '104-105-108-109' AS RIND FROM DUAL UNION
--SELECT 'Vila turistica'      AS DENUMIRE,                        '113' AS ORDINE,   '104'    AS RIND FROM DUAL UNION
--SELECT 'Bungalou'            AS DENUMIRE,                        '114'   AS ORDINE, '105'    AS RIND FROM DUAL UNION
--SELECT 'Sate de vacanta si alte structuri' AS DENUMIRE,          '115' AS ORDINE,   '109'  AS RIND FROM DUAL UNION
--SELECT 'Camping'                           AS DENUMIRE,          '116' AS ORDINE,   '108'    AS RIND FROM DUAL UNION
--SELECT 'Tabere de vacanta'                 AS DENUMIRE,          '117' AS ORDINE,   '110'    AS RIND FROM DUAL 
--ORDER BY ORDINE
--) D
--  CROSS JOIN CIS2.VW_CL_CUATM C
WHERE
 -- C.PRGS IN (2) AND
 -- C.CODUL NOT IN ('9800000')
  -- AND 
   D.ID_MDTABLE = 14612 
  
  
  ORDER BY 
  D.ORDINE