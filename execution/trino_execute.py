import trino
print("trino loaded.")
def execute_trino_query(*args,**kwargs):
    try:
        user_host = kwargs.get('host')
        user_port = kwargs.get('port',5432)
        user_db = kwargs.get("database")
        username = kwargs.get("username")
        password = kwargs.get("password")
        user_query = kwargs.get("query")
        user_schema = kwargs.get("schema","public")

        if not all([user_host,user_host,user_db,username,password,user_query]):
            raise ValueError("missing db parameters")
        
        print("recieved all necessary data")

        jdbc_url = f"jdbc:postgresql://{user_host}:{user_port}/{user_db}?user={username}&password={password}"

        print("establishing connection")

        con = trino.dbapi.connect(
            host="trino",
            port = 8080,
            user="admin",
            catalog = user_db,
            schema = user_schema,
            http_scheme = "http",
            extra_credential=[
                ("jdbc_url", jdbc_url)
            ]
        )
        cursor = con.cursor()
        print("executing query")
        cursor.execute(user_query)
        rows = cursor.fetchall()
        return rows

    except Exception as e:
        return str(e)
    
data = {
    "host": "db.kyixkdtwswntfsicneqg.supabase.co",
    "port": 5432,
    "database": "postgres",
    "schema": "public",
    "query": "SELECT * FROM students LIMIT 10;",
    "username": "postgres",
    "password": "[YOUR-PASSWORD]"
}
result = execute_trino_query(**data)
print("query result",result)