pipeline {
    agent any

    environment {
        DOCKER_HUB_CREDENTIALS = credentials('docker-hub-credentials')
    }

    stages {
        stage('Checkout') {
            steps {
                // Lấy source code từ GitHub
                git branch: 'main', url: 'https://github.com/username/my-repo.git'
            }
        }
        
        stage('Generate Docker Tag') {
            steps {
                script {
                    // Sử dụng commit hash và timestamp để tạo Docker tag
                    def commitHash = sh(script: 'git rev-parse --short HEAD', returnStdout: true).trim()
                    def timestamp = sh(script: 'date +%Y%m%d%H%M%S', returnStdout: true).trim()
                    env.DOCKER_TAG = "${commitHash}-${timestamp}"
                    echo "Generated Docker Tag: ${env.DOCKER_TAG}"
                }
            }
        }

        stage('Determine Changed Folder') {
            steps {
                script {
                    // Lấy danh sách các file đã thay đổi
                    def changedFiles = sh(script: 'git diff --name-only HEAD~1 HEAD', returnStdout: true).trim().split('\n')

                    // Xác định thư mục nào đã thay đổi
                    def buildService1 = changedFiles.any { it.startsWith('job/') }
                    def buildService2 = changedFiles.any { it.startsWith('company/') }
                    def buildService3 = changedFiles.any { it.startsWith('user/') }

                    env.BUILD_SERVICE1 = buildService1 ? "true" : "false"
                    env.BUILD_SERVICE2 = buildService2 ? "true" : "false"
                    env.BUILD_SERVICE3 = buildService3 ? "true" : "false"
                }
            }
        }
        
        stage('Build Docker Image for job') {
            when {
                expression { env.BUILD_SERVICE1 == "true" }
            }
            steps {
                script {
                    echo 'Building Docker Image for job...'
                    sh '''
                        docker build -t mydockerhub/job:${DOCKER_TAG} ./job
                        docker login -u $DOCKER_HUB_CREDENTIALS_USR -p $DOCKER_HUB_CREDENTIALS_PSW
                        docker push mydockerhub/job:${DOCKER_TAG}
                    '''
                }
            }
        }
        
        stage('Build Docker Image for company') {
            when {
                expression { env.BUILD_SERVICE2 == "true" }
            }
            steps {
                script {
                    echo 'Building Docker Image for company...'
                    sh '''
                        docker build -t mydockerhub/company:${DOCKER_TAG} ./company
                        docker login -u $DOCKER_HUB_CREDENTIALS_USR -p $DOCKER_HUB_CREDENTIALS_PSW
                        docker push mydockerhub/company:${DOCKER_TAG}
                    '''
                }
            }
        }
        
        stage('Build Docker Image for user') {
            when {
                expression { env.BUILD_SERVICE3 == "true" }
            }
            steps {
                script {
                    echo 'Building Docker Image for user...'
                    sh '''
                        docker build -t mydockerhub/user:${DOCKER_TAG} ./user
                        docker login -u $DOCKER_HUB_CREDENTIALS_USR -p $DOCKER_HUB_CREDENTIALS_PSW
                        docker push mydockerhub/user:${DOCKER_TAG}
                    '''
                }
            }
        }
    }
}