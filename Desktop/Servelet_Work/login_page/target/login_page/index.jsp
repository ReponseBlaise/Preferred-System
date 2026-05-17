<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Servlet Assignments</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }
        
        body {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            justify-content: center;
            align-items: center;
            padding: 20px;
        }
        
        .container {
            background: white;
            border-radius: 15px;
            box-shadow: 0 20px 50px rgba(0, 0, 0, 0.2);
            padding: 40px;
            max-width: 800px;
            width: 100%;
            animation: fadeIn 0.8s ease-out;
        }
        
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(30px); }
            to { opacity: 1; transform: translateY(0); }
        }
        
        h1 {
            color: #333;
            text-align: center;
            margin-bottom: 10px;
            font-size: 2.5rem;
            background: linear-gradient(90deg, #667eea, #764ba2);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }
        
        .subtitle {
            text-align: center;
            color: #666;
            margin-bottom: 40px;
            font-size: 1.1rem;
        }
        
        .assignments {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 30px;
            margin: 40px 0;
        }
        
        .assignment {
            background: #f8f9fa;
            border-radius: 10px;
            padding: 30px;
            border-left: 5px solid #667eea;
            transition: all 0.3s ease;
            border: 1px solid #e9ecef;
        }
        
        .assignment:hover {
            transform: translateY(-5px);
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
            border-left-color: #764ba2;
        }
        
        .assignment:nth-child(2) {
            border-left-color: #38ef7d;
        }
        
        .assignment:nth-child(2):hover {
            border-left-color: #11998e;
        }
        
        .assignment h3 {
            color: #333;
            margin-bottom: 15px;
            font-size: 1.5rem;
            display: flex;
            align-items: center;
            gap: 10px;
        }
        
        .assignment h3 i {
            font-size: 1.8rem;
        }
        
        .assignment p {
            color: #666;
            line-height: 1.6;
            margin-bottom: 20px;
        }
        
        .features {
            margin: 15px 0;
            padding-left: 20px;
        }
        
        .features li {
            color: #555;
            margin-bottom: 8px;
            list-style-type: none;
            position: relative;
            padding-left: 25px;
        }
        
        .features li:before {
            content: "✓";
            position: absolute;
            left: 0;
            color: #38ef7d;
            font-weight: bold;
        }
        
        .btn {
            display: inline-block;
            padding: 12px 30px;
            background: linear-gradient(90deg, #667eea, #764ba2);
            color: white;
            text-decoration: none;
            border-radius: 8px;
            font-weight: 600;
            transition: all 0.3s ease;
            border: none;
            cursor: pointer;
            margin-top: 10px;
        }
        
        .btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
        }
        
        .btn-green {
            background: linear-gradient(90deg, #11998e, #38ef7d);
        }
        
        .btn-green:hover {
            box-shadow: 0 8px 25px rgba(17, 153, 142, 0.4);
        }
        
        .footer {
            text-align: center;
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #eee;
            color: #888;
        }
        
        @media (max-width: 768px) {
            .container {
                padding: 25px;
            }
            
            h1 {
                font-size: 2rem;
            }
            
            .assignments {
                grid-template-columns: 1fr;
            }
        }
    </style>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
</head>
<body>
    <div class="container">
        <h1><i class="fas fa-code"></i> Java Servlet Assignments</h1>
        <p class="subtitle">Complete implementation of two servlet assignments with modern design</p>
        
        <div class="assignments">
            <div class="assignment">
                <h3><i class="fas fa-lock"></i> Assignment 1: Login Servlet</h3>
                <p>Design a login page with username and password validation.</p>
                <ul class="features">
                    <li>Servlet receives username and password parameters</li>
                    <li>Password validation (minimum 8 characters)</li>
                    <li>Dynamic response based on password strength</li>
                    <li>Clean, modern user interface</li>
                </ul>
                <a href="login.html" class="btn">
                    <i class="fas fa-rocket"></i> Launch Assignment 1
                </a>
            </div>
            
            <div class="assignment">
                <h3><i class="fas fa-external-link-alt"></i> Assignment 2: Send Redirect</h3>
                <p>Create a page that redirects to Google search using servlet.</p>
                <ul class="features">
                    <li>Input field with search term</li>
                    <li>Servlet uses sendRedirect() method</li>
                    <li>Redirects to Google with search parameter</li>
                    <li>Responsive design with animations</li>
                </ul>
                <a href="redirect.html" class="btn btn-green">
                    <i class="fas fa-rocket"></i> Launch Assignment 2
                </a>
            </div>
        </div>
        
        <div class="footer">
            <p><i class="fas fa-laptop-code"></i> Servlet Application | Created with Java, HTML, CSS</p>
            <p style="font-size: 0.9rem; margin-top: 10px;">Access the files directly: 
                <a href="login.html" style="color: #667eea;">Login Page</a> | 
                <a href="redirect.html" style="color: #11998e;">Redirect Page</a>
            </p>
        </div>
    </div>
</body>
</html>