pipeline {
    agent any
    
    environment {
        DOCKER_HUB_CREDENTIALS = credentials('docker-hub-credentials')
        GIT_CREDENTIALS_ID = 'github-credentials'

    }

    stages {
        stage('Checkout') {
            steps {
                script {
                    // Checkout code từ GitHub repository sử dụng Jenkins GitSCM
                    checkout([
                        $class: 'GitSCM',
                        branches: [[name: '*/master']],
                        userRemoteConfigs: [[
                            url: 'https://github.com/nguyenhung1402/repo_dev.git',
                            credentialsId: GIT_CREDENTIALS_ID
                        ]]
                    ])
                }
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
                        docker build -t nguyenhung1402/job_jenkins:${DOCKER_TAG} ./job
                        docker login -u $DOCKER_HUB_CREDENTIALS_USR -p $DOCKER_HUB_CREDENTIALS_PSW
                        docker push nguyenhung1402/job_jenkins:${DOCKER_TAG}
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
                        docker build -t nguyenhung1402/company_jenkins:${DOCKER_TAG} ./company
                        docker login -u $DOCKER_HUB_CREDENTIALS_USR -p $DOCKER_HUB_CREDENTIALS_PSW
                        docker push nguyenhung1402/company_jenkins:${DOCKER_TAG}
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
                        docker build -t nguyenhung1402/user_jenkins:${DOCKER_TAG} ./user
                        docker login -u $DOCKER_HUB_CREDENTIALS_USR -p $DOCKER_HUB_CREDENTIALS_PSW
                        docker push nguyenhung1402/user_jenkins:${DOCKER_TAG}
                    '''
                }
            }
        }

        stage('test k8s') {
           agent {
                kubernetes {
      yaml '''
        apiVersion: v1
        kind: Pod
        spec:
          containers:
          - name: maven
            image: busybox
            command:
            - sh
            - -c
            - |
              mkdir -p /usr/local/bin && \
              wget --no-check-certificate -q -O /usr/local/bin/kubectl https://dl.k8s.io/release/$(wget --no-check-certificate -q -O - https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl && \
              chmod +x /usr/local/bin/kubectl && \
              sleep infinity
            tty: true
          restartPolicy: Never
      '''
    }
            }
            stages {
                stage('Verify kubectl') {
                steps {
                    container('maven') {
                    sh 'kubectl get deployments -n default'
                    }
                }
                }
                stage('deploy user'){
                    when {
                    expression { env.BUILD_SERVICE3 == "true" }
                    }
                    steps {
                        container('maven') {
                        sh '''
                            kubectl set image deployment/user-depl user=nguyenhung1402/user_jenkins:${DOCKER_TAG} 
                            kubectl rollout status deployment/user-depl
                        '''
                        }
                    }
                }
                stage('deploy company'){
                    when {
                    expression { env.BUILD_SERVICE2 == "true" }
                    }
                    steps {
                        container('maven') {
                        sh '''
                            kubectl set image deployment/company-depl  company=nguyenhung1402/company_jenkins:${DOCKER_TAG} 
                            kubectl rollout status deployment/company-depl 
                        '''
                        }
                    }
                }
                stage('deploy job'){
                    when {
                    expression { env.BUILD_SERVICE1 == "true" }
                    }
                    steps {
                        container('maven') {
                        sh '''
                            kubectl set image deployment/job-depl job=nguyenhung1402/job_jenkins:${DOCKER_TAG} 
                            kubectl rollout status deployment/job-depl
                        '''
                        }
                    }
                }
                
                
            }
        }
    }
}


// pipeline {
//   agent {
//     kubernetes {
//       yaml '''
//         apiVersion: v1
//         kind: Pod
//         spec:
//           containers:
//           - name: maven
//             image: busybox
//             command:
//             - sh
//             - -c
//             - |
//               mkdir -p /usr/local/bin && \
//               wget --no-check-certificate -q -O /usr/local/bin/kubectl https://dl.k8s.io/release/$(wget --no-check-certificate -q -O - https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl && \
//               chmod +x /usr/local/bin/kubectl && \
//               sleep infinity
//             tty: true
//           restartPolicy: Never
//       '''
//     }
//   }
//   stages {
//     stage('Verify kubectl') {
//       steps {
//         container('maven') {
//           sh 'kubectl version --client'
//         }
//       }
//     }
//     stage('List files') {
//       steps {
//         container('maven') {
//           sh 'ls -la /usr/local/bin'
//         }
//       }
//     }
//   }
// }

// pipeline {
//     environment {
//         DOCKER_HUB_CREDENTIALS = credentials('docker-hub-credentials')
//         GIT_CREDENTIALS_ID = 'github-credentials'
//     }

//     stages {
//         stage('Checkout') {
//             agent any // Sử dụng agent mặc định
//             steps {
//                 script {
//                     // Checkout code từ GitHub repository sử dụng Jenkins GitSCM
//                     checkout([
//                         $class: 'GitSCM',
//                         branches: [[name: '*/master']],
//                         userRemoteConfigs: [[
//                             url: 'https://github.com/nguyenhung1402/repo_dev.git',
//                             credentialsId: GIT_CREDENTIALS_ID
//                         ]]
//                     ])
//                 }
//             }
//         }

//         stage('Generate Docker Tag') {
//             agent any
//             steps {
//                 script {
//                     // Sử dụng commit hash và timestamp để tạo Docker tag
//                     def commitHash = sh(script: 'git rev-parse --short HEAD', returnStdout: true).trim()
//                     def timestamp = sh(script: 'date +%Y%m%d%H%M%S', returnStdout: true).trim()
//                     env.DOCKER_TAG = "${commitHash}-${timestamp}"
//                     echo "Generated Docker Tag: ${env.DOCKER_TAG}"
//                 }
//             }
//         }

//         stage('Determine Changed Folder') {
//             agent any
//             steps {
//                 script {
//                     // Lấy danh sách các file đã thay đổi
//                     def changedFiles = sh(script: 'git diff --name-only HEAD~1 HEAD', returnStdout: true).trim().split('\n')

//                     // Xác định thư mục nào đã thay đổi
//                     def buildService1 = changedFiles.any { it.startsWith('job/') }
//                     def buildService2 = changedFiles.any { it.startsWith('company/') }
//                     def buildService3 = changedFiles.any { it.startsWith('user/') }

//                     env.BUILD_SERVICE1 = buildService1 ? "true" : "false"
//                     env.BUILD_SERVICE2 = buildService2 ? "true" : "false"
//                     env.BUILD_SERVICE3 = buildService3 ? "true" : "false"
//                 }
//             }
//         }

//         // Build Docker images on docker-agent
//         stage('Build Docker Image for job') {
//             agent { label 'docker-agent' }
//             when {
//                 expression { env.BUILD_SERVICE1 == "true" }
//             }
//             steps {
//                 script {
//                     echo 'Building Docker Image for job...'
//                     sh '''
//                         docker build -t nguyenhung1402/job_jenkins:${DOCKER_TAG} ./job
//                         docker login -u $DOCKER_HUB_CREDENTIALS_USR -p $DOCKER_HUB_CREDENTIALS_PSW
//                         docker push nguyenhung1402/job_jenkins:${DOCKER_TAG}
//                     '''
//                 }
//             }
//         }

//         stage('Build Docker Image for company') {
//             agent { label 'docker-agent' }
//             when {
//                 expression { env.BUILD_SERVICE2 == "true" }
//             }
//             steps {
//                 script {
//                     echo 'Building Docker Image for company...'
//                     sh '''
//                         docker build -t nguyenhung1402/company_jenkins:${DOCKER_TAG} ./company
//                         docker login -u $DOCKER_HUB_CREDENTIALS_USR -p $DOCKER_HUB_CREDENTIALS_PSW
//                         docker push nguyenhung1402/company_jenkins:${DOCKER_TAG}
//                     '''
//                 }
//             }
//         }

//         stage('Build Docker Image for user') {
//             agent { label 'docker-agent' }
//             when {
//                 expression { env.BUILD_SERVICE3 == "true" }
//             }
//             steps {
//                 script {
//                     echo 'Building Docker Image for user...'
//                     sh '''
//                         docker build -t nguyenhung1402/user_jenkins:${DOCKER_TAG} ./user
//                         docker login -u $DOCKER_HUB_CREDENTIALS_USR -p $DOCKER_HUB_CREDENTIALS_PSW
//                         docker push nguyenhung1402/user_jenkins:${DOCKER_TAG}
//                     '''
//                 }
//             }
//         }

//         // Deploy on k8s-agent
//         stage('Deploy to Kubernetes - job') {
//             agent { label 'k8s-agent' }
//             when {
//                 expression { env.BUILD_SERVICE1 == "true" }
//             }
//             steps {
//                 script {
//                     echo 'Deploying job to Kubernetes...'
//                     sh '''
//                         kubectl set image deployment/job-deployment job=nguyenhung1402/job_jenkins:${DOCKER_TAG} --record
//                         kubectl rollout status deployment/job-deployment
//                     '''
//                 }
//             }
//         }

//         stage('Deploy to Kubernetes - company') {
//             agent { label 'k8s-agent' }
//             when {
//                 expression { env.BUILD_SERVICE2 == "true" }
//             }
//             steps {
//                 script {
//                     echo 'Deploying company to Kubernetes...'
//                     sh '''
//                         kubectl set image deployment/company-deployment company=nguyenhung1402/company_jenkins:${DOCKER_TAG} --record
//                         kubectl rollout status deployment/company-deployment
//                     '''
//                 }
//             }
//         }

//         stage('Deploy to Kubernetes - user') {
//             agent { label 'k8s-agent' }
//             when {
//                 expression { env.BUILD_SERVICE3 == "true" }
//             }
//             steps {
//                 script {
//                     echo 'Deploying user to Kubernetes...'
//                     sh '''
//                         kubectl set image deployment/user-deployment user=nguyenhung1402/user_jenkins:${DOCKER_TAG} --record
//                         kubectl rollout status deployment/user-deployment
//                     '''
//                 }
//             }
//         }
//     }
// }
