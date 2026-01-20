SELECT
  d.rind_d  AS RIND_D,
  '1'       AS RIND_S,
  d.id_md_d AS ID_MD_D,
  s.id_md_s AS ID_MD_S,
  1010      AS CAPITOL,
  s.denumire AS DENUMIRE
FROM (
  SELECT '101'   AS rind_d, 11795  AS id_md_d FROM dual UNION ALL
  SELECT '102'   AS rind_d, 11796  AS id_md_d FROM dual UNION ALL
  SELECT '103'   AS rind_d, 11797  AS id_md_d FROM dual UNION ALL
  SELECT '104'   AS rind_d, 11798  AS id_md_d FROM dual UNION ALL
  SELECT '105'   AS rind_d, 11799  AS id_md_d FROM dual UNION ALL
  SELECT '106'   AS rind_d, 11800  AS id_md_d FROM dual UNION ALL
  SELECT '107'   AS rind_d, 11801  AS id_md_d FROM dual UNION ALL
  SELECT '108'   AS rind_d, 11802  AS id_md_d FROM dual UNION ALL
  SELECT '109'   AS rind_d, 11803  AS id_md_d FROM dual UNION ALL
  SELECT '110'   AS rind_d, 11804  AS id_md_d FROM dual UNION ALL
  SELECT '111'   AS rind_d, 11805  AS id_md_d FROM dual UNION ALL
  SELECT '112'   AS rind_d, 112231 AS id_md_d FROM dual UNION ALL
  SELECT '112.1' AS rind_d, 112232 AS id_md_d FROM dual UNION ALL
  SELECT '112.2' AS rind_d, 112233 AS id_md_d FROM dual UNION ALL
  SELECT '113.1' AS rind_d, 12238  AS id_md_d FROM dual UNION ALL
  SELECT '113.2' AS rind_d, 12240  AS id_md_d FROM dual UNION ALL
  SELECT '113.3' AS rind_d, 12241  AS id_md_d FROM dual UNION ALL
  SELECT '113.5' AS rind_d, 12242  AS id_md_d FROM dual UNION ALL
  SELECT '113.4' AS rind_d, 12524  AS id_md_d FROM dual
) d
CROSS JOIN (
  SELECT 11788 AS id_md_s, 1 AS rind, '5 stele'       AS denumire FROM dual UNION ALL
  SELECT 11789 AS id_md_s, 2 AS rind, '4 stele'       AS denumire FROM dual UNION ALL
  SELECT 11790 AS id_md_s, 3 AS rind, '3 stele'       AS denumire FROM dual UNION ALL
  SELECT 11791 AS id_md_s, 4 AS rind, '2 stele'       AS denumire FROM dual UNION ALL
  SELECT 11792 AS id_md_s, 5 AS rind, '1 stea'        AS denumire FROM dual UNION ALL
  SELECT 11793 AS id_md_s, 6 AS rind, 'Neclasificate' AS denumire FROM dual
) s
ORDER BY
  s.rind,
  CASE
    WHEN d.rind_d LIKE '%.%' THEN TO_NUMBER(SUBSTR(d.rind_d, 1, INSTR(d.rind_d, '.') - 1))
    ELSE TO_NUMBER(d.rind_d)
  END,
  CASE
    WHEN d.rind_d LIKE '%.%' THEN TO_NUMBER(SUBSTR(d.rind_d, INSTR(d.rind_d, '.') + 1))
    ELSE 0
  END;
