--DECLARE
--  CURSOR C IS
--    SELECT
--      DF.PERIOADA,
--      DF.FORM,
--      DF.FORM_VERS,
--      DF.ID_MDTABLE,
--      DF.COD_CUATM,
--      DF.NR_SECTIE,
--      DF.NUME_SECTIE,
--      DF.NR_SECTIE1,
--      DF.NUME_SECTIE1,
--      DF.NR_SECTIE2,
--      DF.NUME_SECTIE2,
--      DF.NR_ROW NR_ROW,
--      DF.ORDINE,
--      DF.DECIMAL_POS,
--      DF.NUME_ROW,
--      DF.COL1,
--      DF.COL2,
--      DF.COL3,
--      DF.COL4,
--      DF.COL5,
--      DF.COL6
--    FROM (
      SELECT
        :pPERIOADA AS PERIOADA,
        :pFORM AS FORM,
        :pFORM_VERS AS FORM_VERS,
        :pID_MDTABLE AS ID_MDTABLE,
        :pCOD_CUATM AS COD_CUATM,
        CASE WHEN VB.R402 IS NULL THEN 1 ELSE 2 END AS NR_SECTIE,
        CASE WHEN VB.R402 IS NOT NULL THEN VB.R402 ELSE VB.R401 END AS NUME_SECTIE,
        '0' AS NR_SECTIE1,
        '0' AS NUME_SECTIE1,
        '0' AS NR_SECTIE2,
        '0' AS NUME_SECTIE2,
        VB.COL1 || '~' || VB.ORDINE || '_' || CASE WHEN VB.R401 IS NULL THEN 1 ELSE 2 END AS NR_ROW,
        VB.ORDINE,
        '000000' AS DECIMAL_POS,
        VB.DENUMIRE AS NUME_ROW,
        VB.COL2 AS COL1,
        VB.COL3 AS COL2,
        VB.COL4 AS COL3,
        VB.COL5 AS COL4,
        VB.COL6 AS COL5,
        VB.COL7 AS COL6
      FROM (
        SELECT
          T.DENUMIRE,
          T.ORDINE,
          T.R401 AS R401,
          T.R402 AS R402,
          SUM(DD.CNT) AS COL1,
          SUM(DD.R201_2) AS COL2,
          SUM(DD.R202_2) AS COL3,
          SUM(DD.R203_2) AS COL4,
          SUM(DD.R204_2) AS COL5,
          SUM(DD.R205_2) AS COL6,
          SUM(DD.R516_1) AS COL7
        FROM (
          SELECT
            A.RIND AS RIND_S,
            B.RIND AS RIND_D,
            A.CUIIO,
            A.CAPITOL,
            A.ID_MD AS ID_MD_S,
            B.ID_MD AS ID_MD_D,
            SUM(A.COL1) AS COL1_S,
            SUM(B.COL1) AS COL1_D
          FROM (
            SELECT
              D.CUIIO,
              D.CFP,
              D.RIND,
              D.ID_MD,
              D.CAPITOL,
              CIS2.NVAL(D.COL1) AS COL1
            FROM CIS2.VW_DATA_ALL D
            WHERE
              (D.PERIOADA = :pPERIOADA)
              AND (D.CUATM_FULL LIKE '%' || :pCOD_CUATM || ';%')
              AND D.FORM IN (20)
              AND D.CAPITOL IN (1010)
              AND D.RIND IN ('1','2','3','4','5','6')
             -- AND D.CUIIO = 458868
          ) A
          INNER JOIN (
            SELECT
              D.CUIIO,
              D.CFP,
              D.RIND,
              D.ID_MD,
              D.CAPITOL,
              CIS2.NVAL(D.COL1) AS COL1
            FROM CIS2.VW_DATA_ALL D
            WHERE
              (D.PERIOADA = :pPERIOADA)
              AND (D.CUATM_FULL LIKE '%' || :pCOD_CUATM || ';%')
              AND D.FORM IN (20)
              AND D.CAPITOL IN (1010)
              AND D.RIND NOT IN ('00','--','1','2','3','4','5','6')
             -- AND D.CUIIO = 458868
          ) B ON (A.CUIIO = B.CUIIO)
          GROUP BY
            A.RIND,
            B.RIND,
            A.ID_MD,
            B.ID_MD,
            A.CUIIO,
            A.CAPITOL
        ) D
        LEFT JOIN (
          SELECT
            D.CUIIO,
            MAX(CASE WHEN D.CAPITOL IN (1014) AND MR.RIND IN ('401') AND CIS2.NVAL(D.COL1) > 0 THEN MR.DENUMIRE END) AS R401,
            MAX(CASE WHEN D.CAPITOL IN (1014) AND MR.RIND IN ('402') AND CIS2.NVAL(D.COL1) > 0 THEN MR.DENUMIRE END) AS R402,
            SUM(CASE WHEN D.CAPITOL IN (1011) AND D.RIND IN ('201') AND CIS2.NVAL(D.COL2) > 0 THEN 1 END) AS CNT,
            SUM(CASE WHEN D.CAPITOL IN (1011) AND D.RIND IN ('201') THEN CIS2.NVAL(D.COL1) ELSE 0 END) AS R201_1,
            SUM(CASE WHEN D.CAPITOL IN (1011) AND D.RIND IN ('201') THEN CIS2.NVAL(D.COL2) ELSE 0 END) AS R201_2,
            SUM(CASE WHEN D.CAPITOL IN (1011) AND D.RIND IN ('201') THEN CIS2.NVAL(D.COL3) ELSE 0 END) AS R201_3,
            SUM(CASE WHEN D.CAPITOL IN (1011) AND D.RIND IN ('202') THEN CIS2.NVAL(D.COL1) ELSE 0 END) AS R202_1,
            SUM(CASE WHEN D.CAPITOL IN (1011) AND D.RIND IN ('202') THEN CIS2.NVAL(D.COL2) ELSE 0 END) AS R202_2,
            SUM(CASE WHEN D.CAPITOL IN (1011) AND D.RIND IN ('202') THEN CIS2.NVAL(D.COL3) ELSE 0 END) AS R202_3,
            SUM(CASE WHEN D.CAPITOL IN (1011) AND D.RIND IN ('203') THEN CIS2.NVAL(D.COL1) ELSE 0 END) AS R203_1,
            SUM(CASE WHEN D.CAPITOL IN (1011) AND D.RIND IN ('203') THEN CIS2.NVAL(D.COL2) ELSE 0 END) AS R203_2,
            SUM(CASE WHEN D.CAPITOL IN (1011) AND D.RIND IN ('203') THEN CIS2.NVAL(D.COL3) ELSE 0 END) AS R203_3,
            SUM(CASE WHEN D.CAPITOL IN (1011) AND D.RIND IN ('204') THEN CIS2.NVAL(D.COL1) ELSE 0 END) AS R204_1,
            SUM(CASE WHEN D.CAPITOL IN (1011) AND D.RIND IN ('204') THEN CIS2.NVAL(D.COL2) ELSE 0 END) AS R204_2,
            SUM(CASE WHEN D.CAPITOL IN (1011) AND D.RIND IN ('204') THEN CIS2.NVAL(D.COL3) ELSE 0 END) AS R204_3,
            SUM(CASE WHEN D.CAPITOL IN (1011) AND D.RIND IN ('205') THEN CIS2.NVAL(D.COL1) ELSE 0 END) AS R205_1,
            SUM(CASE WHEN D.CAPITOL IN (1011) AND D.RIND IN ('205') THEN CIS2.NVAL(D.COL2) ELSE 0 END) AS R205_2,
            SUM(CASE WHEN D.CAPITOL IN (1011) AND D.RIND IN ('205') THEN CIS2.NVAL(D.COL3) ELSE 0 END) AS R205_3,
            SUM(CASE WHEN D.CAPITOL IN (1011) AND D.RIND IN ('206') THEN CIS2.NVAL(D.COL1) ELSE 0 END) AS R206_1,
            SUM(CASE WHEN D.CAPITOL IN (1011) AND D.RIND IN ('206') THEN CIS2.NVAL(D.COL2) ELSE 0 END) AS R206_2,
            SUM(CASE WHEN D.CAPITOL IN (1011) AND D.RIND IN ('206') THEN CIS2.NVAL(D.COL3) ELSE 0 END) AS R206_3,
            SUM(CASE WHEN D.CAPITOL IN (1011) AND D.RIND IN ('207') THEN CIS2.NVAL(D.COL1) ELSE 0 END) AS R207_1,
            SUM(CASE WHEN D.CAPITOL IN (1011) AND D.RIND IN ('207') THEN CIS2.NVAL(D.COL2) ELSE 0 END) AS R207_2,
            SUM(CASE WHEN D.CAPITOL IN (1011) AND D.RIND IN ('207') THEN CIS2.NVAL(D.COL3) ELSE 0 END) AS R207_3,
            SUM(CASE WHEN D.CAPITOL IN (1016) AND D.RIND IN ('516') THEN CIS2.NVAL(D.COL1) ELSE 0 END) AS R516_1
          FROM CIS2.VW_DATA_ALL D
          INNER JOIN CIS2.MD_RIND MR ON (D.ID_MD = MR.ID_MD)
          WHERE
            (D.PERIOADA = :pPERIOADA)
            AND (:pID_MDTABLE = :pID_MDTABLE)
            AND (D.CUATM_FULL LIKE '%' || :pCOD_CUATM || ';%')
            AND D.FORM IN (20)
            AND D.CAPITOL IN (1011,1016,1014)
          --  AND D.CUIIO = 458868
          GROUP BY D.CUIIO
        ) DD ON (D.CUIIO = DD.CUIIO)
        RIGHT JOIN (
          SELECT
            D.DENUMIRE,
            D.ORDINE,
            D.RIND,
            CASE WHEN MR.RIND IN ('401') THEN MR.DENUMIRE END AS R401,
            CASE WHEN MR.RIND IN ('402') THEN MR.DENUMIRE END AS R402
          FROM CIS2.MD_RIND_OUT D
          CROSS JOIN CIS2.MD_RIND MR
          WHERE 
          D.ID_MDTABLE = 14612 AND MR.CAPITOL IN (1014)
          
        ) T ON (T.RIND LIKE '%' || D.RIND_D || '%' AND (DD.R401 = T.R401 OR DD.R402 = T.R402))
        GROUP BY
          T.DENUMIRE,
          T.ORDINE,
          T.R401,
          T.R402

        UNION

        SELECT
          A.DENUMIRE,
          TO_NUMBER(A.ORDINE || '.' || A.RIND_S) ORDINE,
          A.R401 AS R401,
          A.R402 AS R402,
          B.COL1,
          B.COL2,
          B.COL3,
          B.COL4,
          B.COL5,
          B.COL6,
          B.COL7
        FROM (
          SELECT
            B.RIND AS RIND_D,
            A.RIND AS RIND_S,
            B.ID_MD AS ID_MD_D,
            A.ID_MD AS ID_MD_S,
            B.CAPITOL,
            A.DENUMIRE,
            T.ORDINE,
            CASE WHEN MR.RIND IN ('401') THEN MR.DENUMIRE END AS R401,
            CASE WHEN MR.RIND IN ('402') THEN MR.DENUMIRE END AS R402
          FROM (
            SELECT
              R.RIND,
              R.DENUMIRE,
              R.ID_MD,
              R.CAPITOL,
              ROWNUM
            FROM CIS2.MD_RIND R
            WHERE
              R.FORM IN (20)
              AND R.CAPITOL IN (1010)
              AND R.RIND IN ('1','2','3','4','5','6')
          ) A
          CROSS JOIN (
            SELECT
              R.RIND,
              R.DENUMIRE,
              R.ID_MD,
              R.CAPITOL,
              ROWNUM
            FROM CIS2.MD_RIND R
            WHERE
              R.FORM IN (20)
              AND R.CAPITOL IN (1010)
              AND R.RIND NOT IN ('00','--','1','2','3','4','5','6','113')
          ) B
          INNER JOIN (
            SELECT
              D.ORDINE,
              D.RIND
            FROM CIS2.MD_RIND_OUT D
            WHERE D.ID_MDTABLE = 14630
          ) T ON (T.RIND = B.RIND)
          CROSS JOIN CIS2.MD_RIND MR
          WHERE MR.CAPITOL IN (1014)
          ORDER BY
            CASE WHEN MR.RIND IN ('401') THEN MR.DENUMIRE END,
            CASE WHEN MR.RIND IN ('402') THEN MR.DENUMIRE END,
            T.ORDINE,
            B.RIND,
            A.RIND
        ) A
        LEFT JOIN (
          SELECT
            D.RIND_S,
            D.RIND_D,
            D.ID_MD_S,
            D.ID_MD_D,
            DD.R401 AS R401,
            DD.R402 AS R402,
            SUM(DD.CNT) AS COL1,
            SUM(DD.R201_2) AS COL2,
            SUM(DD.R202_2) AS COL3,
            SUM(DD.R203_2) AS COL4,
            SUM(DD.R204_2) AS COL5,
            SUM(DD.R205_1) AS COL6,
            SUM(DD.R516_1) AS COL7
          FROM (
            SELECT
              A.RIND AS RIND_S,
              B.RIND AS RIND_D,
              A.CUIIO,
              A.CAPITOL,
              A.ID_MD AS ID_MD_S,
              B.ID_MD AS ID_MD_D,
              SUM(A.COL1) AS COL1_S,
              SUM(B.COL1) AS COL1_D
            FROM (
              SELECT
                D.CUIIO,
                D.CFP,
                D.RIND,
                D.ID_MD,
                D.CAPITOL,
                CIS2.NVAL(D.COL1) AS COL1
              FROM CIS2.VW_DATA_ALL D
              WHERE
                (D.PERIOADA = :pPERIOADA)
                AND (D.CUATM_FULL LIKE '%' || :pCOD_CUATM || ';%')
                AND D.FORM IN (20)
                AND D.CAPITOL IN (1010)
                AND D.RIND IN ('1','2','3','4','5','6')
               -- AND D.CUIIO = 458868
            ) A
            INNER JOIN (
              SELECT
                D.CUIIO,
                D.CFP,
                D.RIND,
                D.ID_MD,
                D.CAPITOL,
                CIS2.NVAL(D.COL1) AS COL1
              FROM CIS2.VW_DATA_ALL D
              WHERE
                (D.PERIOADA = :pPERIOADA)
                AND (D.CUATM_FULL LIKE '%' || :pCOD_CUATM || ';%')
                AND D.FORM IN (20)
                AND D.CAPITOL IN (1010)
                AND D.RIND NOT IN ('00','--','1','2','3','4','5','6','113')
               -- AND D.CUIIO = 458868
            ) B ON (A.CUIIO = B.CUIIO)
            GROUP BY
              A.RIND,
              B.RIND,
              A.ID_MD,
              B.ID_MD,
              A.CUIIO,
              A.CAPITOL
          ) D
          LEFT JOIN (
            SELECT
              D.CUIIO,
              MAX(CASE WHEN D.CAPITOL IN (1014) AND MR.RIND IN ('401') AND CIS2.NVAL(D.COL1) > 0 THEN MR.DENUMIRE END) AS R401,
              MAX(CASE WHEN D.CAPITOL IN (1014) AND MR.RIND IN ('402') AND CIS2.NVAL(D.COL1) > 0 THEN MR.DENUMIRE END) AS R402,
              SUM(CASE WHEN D.CAPITOL IN (1011) AND D.RIND IN ('201') AND CIS2.NVAL(D.COL2) > 0 THEN 1 END) AS CNT,
              SUM(CASE WHEN D.CAPITOL IN (1011) AND D.RIND IN ('201') THEN CIS2.NVAL(D.COL1) ELSE 0 END) AS R201_1,
              SUM(CASE WHEN D.CAPITOL IN (1011) AND D.RIND IN ('201') THEN CIS2.NVAL(D.COL2) ELSE 0 END) AS R201_2,
              SUM(CASE WHEN D.CAPITOL IN (1011) AND D.RIND IN ('201') THEN CIS2.NVAL(D.COL3) ELSE 0 END) AS R201_3,
              SUM(CASE WHEN D.CAPITOL IN (1011) AND D.RIND IN ('202') THEN CIS2.NVAL(D.COL1) ELSE 0 END) AS R202_1,
              SUM(CASE WHEN D.CAPITOL IN (1011) AND D.RIND IN ('202') THEN CIS2.NVAL(D.COL2) ELSE 0 END) AS R202_2,
              SUM(CASE WHEN D.CAPITOL IN (1011) AND D.RIND IN ('202') THEN CIS2.NVAL(D.COL3) ELSE 0 END) AS R202_3,
              SUM(CASE WHEN D.CAPITOL IN (1011) AND D.RIND IN ('203') THEN CIS2.NVAL(D.COL1) ELSE 0 END) AS R203_1,
              SUM(CASE WHEN D.CAPITOL IN (1011) AND D.RIND IN ('203') THEN CIS2.NVAL(D.COL2) ELSE 0 END) AS R203_2,
              SUM(CASE WHEN D.CAPITOL IN (1011) AND D.RIND IN ('203') THEN CIS2.NVAL(D.COL3) ELSE 0 END) AS R203_3,
              SUM(CASE WHEN D.CAPITOL IN (1011) AND D.RIND IN ('204') THEN CIS2.NVAL(D.COL1) ELSE 0 END) AS R204_1,
              SUM(CASE WHEN D.CAPITOL IN (1011) AND D.RIND IN ('204') THEN CIS2.NVAL(D.COL2) ELSE 0 END) AS R204_2,
              SUM(CASE WHEN D.CAPITOL IN (1011) AND D.RIND IN ('204') THEN CIS2.NVAL(D.COL3) ELSE 0 END) AS R204_3,
              SUM(CASE WHEN D.CAPITOL IN (1011) AND D.RIND IN ('205') THEN CIS2.NVAL(D.COL1) ELSE 0 END) AS R205_1,
              SUM(CASE WHEN D.CAPITOL IN (1011) AND D.RIND IN ('205') THEN CIS2.NVAL(D.COL2) ELSE 0 END) AS R205_2,
              SUM(CASE WHEN D.CAPITOL IN (1011) AND D.RIND IN ('205') THEN CIS2.NVAL(D.COL3) ELSE 0 END) AS R205_3,
              SUM(CASE WHEN D.CAPITOL IN (1011) AND D.RIND IN ('206') THEN CIS2.NVAL(D.COL1) ELSE 0 END) AS R206_1,
              SUM(CASE WHEN D.CAPITOL IN (1011) AND D.RIND IN ('206') THEN CIS2.NVAL(D.COL2) ELSE 0 END) AS R206_2,
              SUM(CASE WHEN D.CAPITOL IN (1011) AND D.RIND IN ('206') THEN CIS2.NVAL(D.COL3) ELSE 0 END) AS R206_3,
              SUM(CASE WHEN D.CAPITOL IN (1011) AND D.RIND IN ('207') THEN CIS2.NVAL(D.COL1) ELSE 0 END) AS R207_1,
              SUM(CASE WHEN D.CAPITOL IN (1011) AND D.RIND IN ('207') THEN CIS2.NVAL(D.COL2) ELSE 0 END) AS R207_2,
              SUM(CASE WHEN D.CAPITOL IN (1011) AND D.RIND IN ('207') THEN CIS2.NVAL(D.COL3) ELSE 0 END) AS R207_3,
              SUM(CASE WHEN D.CAPITOL IN (1016) AND D.RIND IN ('516') THEN CIS2.NVAL(D.COL1) ELSE 0 END) AS R516_1
            FROM CIS2.VW_DATA_ALL D
            INNER JOIN CIS2.MD_RIND MR ON (D.ID_MD = MR.ID_MD)
            WHERE
              (D.PERIOADA = :pPERIOADA)
              AND (:pID_MDTABLE = :pID_MDTABLE)
              AND (D.CUATM_FULL LIKE '%' || :pCOD_CUATM || ';%')
              AND D.FORM IN (20)
              AND D.CAPITOL IN (1011,1016,1014)
             -- AND D.CUIIO = 458868
            GROUP BY D.CUIIO
          ) DD ON (D.CUIIO = DD.CUIIO)
          GROUP BY
            D.RIND_S,
            D.RIND_D,
            D.ID_MD_S,
            D.ID_MD_D,
            DD.R401,
            DD.R402
        ) B
          ON (A.RIND_S = B.RIND_S
              AND A.RIND_D = B.RIND_D
              AND A.ID_MD_S = B.ID_MD_S
              AND A.ID_MD_D = B.ID_MD_D
              AND (A.R401 = B.R401 OR A.R402 = B.R402))
      ) VB
      ORDER BY ORDINE
--    ) DF;
--
--BEGIN
--  FOR CR IN C LOOP
--    INSERT INTO CIS2.TABLE_OUT (
--      PERIOADA,
--      FORM,
--      FORM_VERS,
--      ID_MDTABLE,
--      COD_CUATM,
--      NR_SECTIE,
--      NUME_SECTIE,
--      NR_SECTIE1,
--      NUME_SECTIE1,
--      NR_SECTIE2,
--      NUME_SECTIE2,
--      NR_ROW,
--      ORDINE,
--      DECIMAL_POS,
--      NUME_ROW,
--      COL1, COL2, COL3, COL4, COL5, COL6
--    ) VALUES (
--      CR.PERIOADA,
--      CR.FORM,
--      CR.FORM_VERS,
--      CR.ID_MDTABLE,
--      CR.COD_CUATM,
--      CR.NR_SECTIE,
--      CR.NUME_SECTIE,
--      CR.NR_SECTIE1,
--      CR.NUME_SECTIE1,
--      CR.NR_SECTIE2,
--      CR.NUME_SECTIE2,
--      CR.NR_ROW,
--      CR.ORDINE,
--      CR.DECIMAL_POS,
--      CR.NUME_ROW,
--      CR.COL1, CR.COL2, CR.COL3, CR.COL4, CR.COL5, CR.COL6
--    );
--  END LOOP;
--END;
