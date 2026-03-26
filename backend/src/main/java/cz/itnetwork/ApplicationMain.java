package cz.itnetwork;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Vstupní bod Spring Boot aplikace.
 *
 * Předpoklady:
 *   1. XAMPP → MySQL spuštěno na portu 3306
 *   2. Databáze "invoice_app" se vytvoří automaticky
 *   3. Tabulky se vytvoří automaticky (ddl-auto=update)
 *
 * Po spuštění testuj v Postmanu:
 *   http://localhost:8080/api/persons
 */
@SpringBootApplication
public class ApplicationMain {

    public static void main(String[] args) {
        SpringApplication.run(ApplicationMain.class, args);
    }
}
