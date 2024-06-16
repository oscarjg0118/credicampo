import os
import time
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException, ElementClickInterceptedException

# Ruta al ChromeDriver
driver_path = os.path.join(os.path.dirname(__file__), '../drivers/chromedriver.exe')

# Crear una nueva instancia del navegador Chrome utilizando Service
service = Service(executable_path=driver_path)
driver = webdriver.Chrome(service=service)

try:
    # Navegar a la página de registro
    driver.get("http://localhost:3000/registrate.html")

    # Esperar hasta que el formulario de registro esté visible
    wait = WebDriverWait(driver, 30)  # Aumentar el tiempo de espera a 30 segundos
    wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, "input[placeholder='Nombres']")))

    # Rellenar el formulario de registro
    driver.find_element(By.CSS_SELECTOR, "input[placeholder='Nombres']").send_keys("Juan7")
    driver.find_element(By.CSS_SELECTOR, "input[placeholder='Apellidos']").send_keys("Pérez7")
    driver.find_element(By.CSS_SELECTOR, "input[placeholder='Documento']").send_keys("1243433456755")
    driver.find_element(By.CSS_SELECTOR, "input[placeholder='Dirección']").send_keys("Calle Falsa7 123")
    driver.find_element(By.CSS_SELECTOR, "input[placeholder='Ciudad']").send_keys("Ciudad Ejemplo7")
    driver.find_element(By.CSS_SELECTOR, "input[placeholder='Correo Electrónico']").send_keys("juan7@example.com")
    driver.find_element(By.CSS_SELECTOR, "input[placeholder='Celular']").send_keys("9876543217")
    driver.find_element(By.CSS_SELECTOR, "input[placeholder='Contraseña']").send_keys("claveSegura127")
    driver.find_element(By.CSS_SELECTOR, "input[placeholder='Confirmar Contraseña']").send_keys("claveSegura127")

    # Hacer scroll al botón de enviar y luego hacer clic
    submit_button = driver.find_element(By.CSS_SELECTOR, "input[type='submit']")
    driver.execute_script("arguments[0].scrollIntoView(true);", submit_button)
    
    # Agregar una pequeña pausa antes del clic
    time.sleep(1)
    
    # Hacer clic en el botón de enviar
    submit_button.click()

    # Esperar hasta que la URL contenga "registro_exitoso"
    wait.until(EC.url_contains("registro_exitoso"))

    # Verificar la URL actual
    current_url = driver.current_url
    print(f"Registro exitoso. URL actual: {current_url}")

except TimeoutException as ex:
    print(f"Error: TimeoutException - {ex}")

except ElementClickInterceptedException as ex:
    print(f"Error: ElementClickInterceptedException - {ex}")

finally:
    # Cerrar el navegador
    driver.quit()




