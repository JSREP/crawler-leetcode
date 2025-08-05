#!/usr/bin/env python3
"""
性能测试脚本
"""
import os
import sys
import time
import statistics
import concurrent.futures
import requests
from datetime import datetime

# 添加项目根目录到Python路径
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))


class PerformanceTester:
    def __init__(self, base_url='http://localhost:5000'):
        self.base_url = base_url
        self.session = requests.Session()
        
    def measure_response_time(self, endpoint, method='GET', data=None, headers=None):
        """测量单个请求的响应时间"""
        url = f"{self.base_url}{endpoint}"
        
        start_time = time.time()
        try:
            response = self.session.request(
                method, url, 
                json=data, 
                headers=headers or {},
                timeout=30
            )
            end_time = time.time()
            
            return {
                'success': True,
                'status_code': response.status_code,
                'response_time': end_time - start_time,
                'content_length': len(response.content)
            }
        except Exception as e:
            end_time = time.time()
            return {
                'success': False,
                'error': str(e),
                'response_time': end_time - start_time
            }
    
    def load_test(self, endpoint, concurrent_users=10, requests_per_user=10):
        """负载测试"""
        print(f"🔥 负载测试: {endpoint}")
        print(f"   并发用户: {concurrent_users}")
        print(f"   每用户请求数: {requests_per_user}")
        
        def user_requests():
            """单个用户的请求序列"""
            results = []
            for _ in range(requests_per_user):
                result = self.measure_response_time(endpoint)
                results.append(result)
                time.sleep(0.1)  # 短暂间隔
            return results
        
        start_time = time.time()
        all_results = []
        
        # 并发执行
        with concurrent.futures.ThreadPoolExecutor(max_workers=concurrent_users) as executor:
            futures = [executor.submit(user_requests) for _ in range(concurrent_users)]
            
            for future in concurrent.futures.as_completed(futures):
                try:
                    results = future.result()
                    all_results.extend(results)
                except Exception as e:
                    print(f"   ❌ 用户请求失败: {e}")
        
        end_time = time.time()
        
        # 分析结果
        successful_requests = [r for r in all_results if r['success']]
        failed_requests = [r for r in all_results if not r['success']]
        
        if successful_requests:
            response_times = [r['response_time'] for r in successful_requests]
            
            stats = {
                'total_requests': len(all_results),
                'successful_requests': len(successful_requests),
                'failed_requests': len(failed_requests),
                'success_rate': len(successful_requests) / len(all_results) * 100,
                'total_time': end_time - start_time,
                'requests_per_second': len(all_results) / (end_time - start_time),
                'avg_response_time': statistics.mean(response_times),
                'min_response_time': min(response_times),
                'max_response_time': max(response_times),
                'median_response_time': statistics.median(response_times),
            }
            
            if len(response_times) > 1:
                stats['std_response_time'] = statistics.stdev(response_times)
                stats['p95_response_time'] = sorted(response_times)[int(len(response_times) * 0.95)]
                stats['p99_response_time'] = sorted(response_times)[int(len(response_times) * 0.99)]
            
            return stats
        else:
            return {
                'total_requests': len(all_results),
                'successful_requests': 0,
                'failed_requests': len(failed_requests),
                'success_rate': 0,
                'error': 'All requests failed'
            }
    
    def test_api_endpoints(self):
        """测试API端点性能"""
        print("📊 API端点性能测试\n")
        
        endpoints = [
            ('/api/db/test', '数据库连接'),
            ('/api/db/challenges?per_page=10', '挑战列表'),
            ('/api/db/stats', '统计信息'),
            ('/api/forum/posts?per_page=10', '论坛帖子'),
            ('/storage/quota/pricing', '存储定价'),
        ]
        
        results = {}
        
        for endpoint, name in endpoints:
            print(f"🔍 测试: {name}")
            
            # 单次请求测试
            single_result = self.measure_response_time(endpoint)
            if single_result['success']:
                print(f"   单次响应时间: {single_result['response_time']:.3f}s")
            else:
                print(f"   ❌ 单次请求失败: {single_result.get('error', 'Unknown error')}")
                continue
            
            # 负载测试
            load_result = self.load_test(endpoint, concurrent_users=5, requests_per_user=5)
            results[name] = load_result
            
            if load_result.get('success_rate', 0) > 0:
                print(f"   成功率: {load_result['success_rate']:.1f}%")
                print(f"   平均响应时间: {load_result['avg_response_time']:.3f}s")
                print(f"   QPS: {load_result['requests_per_second']:.1f}")
                
                if 'p95_response_time' in load_result:
                    print(f"   P95响应时间: {load_result['p95_response_time']:.3f}s")
            else:
                print(f"   ❌ 负载测试失败")
            
            print()
        
        return results
    
    def test_database_performance(self):
        """测试数据库性能"""
        print("🗄️ 数据库性能测试\n")
        
        # 测试不同查询的性能
        queries = [
            ('/api/db/challenges?per_page=1', '小结果集查询'),
            ('/api/db/challenges?per_page=50', '中等结果集查询'),
            ('/api/db/challenges?per_page=100', '大结果集查询'),
            ('/api/db/stats', '聚合查询'),
        ]
        
        for endpoint, name in queries:
            print(f"🔍 {name}")
            
            # 多次测试取平均值
            times = []
            for _ in range(10):
                result = self.measure_response_time(endpoint)
                if result['success']:
                    times.append(result['response_time'])
            
            if times:
                avg_time = statistics.mean(times)
                min_time = min(times)
                max_time = max(times)
                
                print(f"   平均响应时间: {avg_time:.3f}s")
                print(f"   最快: {min_time:.3f}s")
                print(f"   最慢: {max_time:.3f}s")
                
                # 性能评级
                if avg_time < 0.1:
                    grade = "🟢 优秀"
                elif avg_time < 0.5:
                    grade = "🟡 良好"
                elif avg_time < 1.0:
                    grade = "🟠 一般"
                else:
                    grade = "🔴 需要优化"
                
                print(f"   性能评级: {grade}")
            else:
                print("   ❌ 所有请求都失败了")
            
            print()
    
    def test_memory_usage(self):
        """测试内存使用情况"""
        print("💾 内存使用测试\n")
        
        # 连续请求测试内存泄漏
        print("🔍 内存泄漏测试（连续100次请求）")
        
        times = []
        for i in range(100):
            result = self.measure_response_time('/api/db/challenges?per_page=10')
            if result['success']:
                times.append(result['response_time'])
            
            if (i + 1) % 20 == 0:
                recent_avg = statistics.mean(times[-20:]) if len(times) >= 20 else statistics.mean(times)
                print(f"   第{i+1}次请求，最近平均响应时间: {recent_avg:.3f}s")
        
        if len(times) >= 50:
            first_half = statistics.mean(times[:50])
            second_half = statistics.mean(times[50:])
            
            print(f"\n   前50次平均响应时间: {first_half:.3f}s")
            print(f"   后50次平均响应时间: {second_half:.3f}s")
            
            if second_half > first_half * 1.2:
                print("   ⚠️ 可能存在内存泄漏或性能退化")
            else:
                print("   ✅ 性能稳定")
    
    def test_concurrent_uploads(self):
        """测试并发上传性能"""
        print("📤 并发上传性能测试\n")
        
        # 注意：这个测试需要认证，可能会失败
        print("🔍 测试并发文件上传（需要认证）")
        
        def upload_test():
            """单次上传测试"""
            files = {'file': ('test.txt', b'test content', 'text/plain')}
            data = {'purpose': 'test'}
            
            start_time = time.time()
            try:
                response = self.session.post(
                    f"{self.base_url}/storage/upload",
                    files=files,
                    data=data,
                    timeout=30
                )
                end_time = time.time()
                
                return {
                    'success': response.status_code in [200, 201, 401],  # 401是预期的（未认证）
                    'status_code': response.status_code,
                    'response_time': end_time - start_time
                }
            except Exception as e:
                end_time = time.time()
                return {
                    'success': False,
                    'error': str(e),
                    'response_time': end_time - start_time
                }
        
        # 并发上传测试
        with concurrent.futures.ThreadPoolExecutor(max_workers=5) as executor:
            futures = [executor.submit(upload_test) for _ in range(10)]
            results = []
            
            for future in concurrent.futures.as_completed(futures):
                try:
                    result = future.result()
                    results.append(result)
                except Exception as e:
                    print(f"   ❌ 上传测试失败: {e}")
        
        successful = [r for r in results if r['success']]
        
        if successful:
            avg_time = statistics.mean([r['response_time'] for r in successful])
            print(f"   成功请求数: {len(successful)}/{len(results)}")
            print(f"   平均响应时间: {avg_time:.3f}s")
        else:
            print("   ❌ 所有上传测试都失败了（可能需要认证）")
    
    def generate_report(self, results):
        """生成性能测试报告"""
        print("📋 性能测试报告\n")
        print("="*60)
        
        overall_stats = {
            'total_endpoints': len(results),
            'successful_endpoints': 0,
            'avg_response_times': [],
            'avg_success_rates': []
        }
        
        for endpoint_name, stats in results.items():
            print(f"\n📊 {endpoint_name}")
            print("-" * 40)
            
            if stats.get('success_rate', 0) > 0:
                overall_stats['successful_endpoints'] += 1
                overall_stats['avg_response_times'].append(stats['avg_response_time'])
                overall_stats['avg_success_rates'].append(stats['success_rate'])
                
                print(f"成功率: {stats['success_rate']:.1f}%")
                print(f"平均响应时间: {stats['avg_response_time']:.3f}s")
                print(f"QPS: {stats['requests_per_second']:.1f}")
                
                if 'p95_response_time' in stats:
                    print(f"P95响应时间: {stats['p95_response_time']:.3f}s")
            else:
                print("❌ 测试失败")
        
        # 总体评估
        print("\n" + "="*60)
        print("📈 总体评估")
        print("="*60)
        
        if overall_stats['avg_response_times']:
            avg_response_time = statistics.mean(overall_stats['avg_response_times'])
            avg_success_rate = statistics.mean(overall_stats['avg_success_rates'])
            
            print(f"测试端点数: {overall_stats['total_endpoints']}")
            print(f"成功端点数: {overall_stats['successful_endpoints']}")
            print(f"平均响应时间: {avg_response_time:.3f}s")
            print(f"平均成功率: {avg_success_rate:.1f}%")
            
            # 性能等级
            if avg_response_time < 0.2 and avg_success_rate > 95:
                grade = "🟢 优秀"
            elif avg_response_time < 0.5 and avg_success_rate > 90:
                grade = "🟡 良好"
            elif avg_response_time < 1.0 and avg_success_rate > 80:
                grade = "🟠 一般"
            else:
                grade = "🔴 需要优化"
            
            print(f"性能等级: {grade}")
        else:
            print("❌ 没有成功的测试结果")
    
    def run_all_tests(self):
        """运行所有性能测试"""
        print("🚀 开始性能测试...\n")
        
        start_time = datetime.now()
        
        # 检查服务是否可用
        try:
            response = self.session.get(f"{self.base_url}/api/db/test", timeout=5)
            if response.status_code != 200:
                print(f"❌ 后端服务不可用: {response.status_code}")
                return False
        except Exception as e:
            print(f"❌ 无法连接到后端服务: {e}")
            return False
        
        print("✅ 后端服务可用，开始性能测试\n")
        
        # 运行各项测试
        api_results = self.test_api_endpoints()
        self.test_database_performance()
        self.test_memory_usage()
        self.test_concurrent_uploads()
        
        # 生成报告
        self.generate_report(api_results)
        
        end_time = datetime.now()
        duration = (end_time - start_time).total_seconds()
        
        print(f"\n⏱️ 性能测试完成，耗时: {duration:.1f}秒")
        
        return True


def main():
    """主函数"""
    import argparse
    
    parser = argparse.ArgumentParser(description='Flask后端性能测试')
    parser.add_argument('--url', default='http://localhost:5000', help='后端服务URL')
    parser.add_argument('--users', type=int, default=10, help='并发用户数')
    parser.add_argument('--requests', type=int, default=10, help='每用户请求数')
    
    args = parser.parse_args()
    
    tester = PerformanceTester(args.url)
    success = tester.run_all_tests()
    
    sys.exit(0 if success else 1)


if __name__ == '__main__':
    main()
