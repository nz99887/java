package com.fenglin.springboottest;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.core.env.ConfigurableEnvironment;
import org.springframework.core.env.MapPropertySource;
import org.springframework.core.env.PropertySource;
import org.springframework.core.env.SystemEnvironmentPropertySource;

import java.util.HashMap;
import java.util.Map;

@SpringBootApplication
public class SpringBootTestApplication {

	/**
	 * 可能被宿主环境（IDE 插件 / 容器平台）注入的变量名。
	 * Spring Boot 的宽松绑定会把 SERVER__PORT 解析为 server.port，
	 * 其优先级高于 application.properties，会覆盖各 profile 中配置的端口。
	 */
	private static final String[] INTERFERING_VARS = {"SERVER__PORT", "SERVER__HOST"};

	public static void main(String[] args) {
		SpringApplication app = new SpringApplication(SpringBootTestApplication.class);

		// 在 environment 就绪后、Web 容器启动前介入：把系统环境变量来源替换为
		// 一份「剔除了干扰项、位置与优先级保持不变」的副本。
		//
		// 只动这一个 Map，不新增高优先级来源，因此不会把端口写死——
		// 端口仍由 application-{profile}.properties 决定；
		// 命令行参数（--server.port=xxx）优先级最高，始终可以覆盖。
		app.addInitializers(applicationContext -> {
			ConfigurableEnvironment env =
					(ConfigurableEnvironment) applicationContext.getEnvironment();

			PropertySource<?> envSource = null;
			for (PropertySource<?> ps : env.getPropertySources()) {
				if (ps instanceof SystemEnvironmentPropertySource) {
					envSource = ps;
					break;
				}
			}
			if (envSource == null) {
				return;
			}

			Object raw = envSource.getSource();
			if (!(raw instanceof Map)) {
				return;
			}

			Map<String, Object> copy = new HashMap<>();
			@SuppressWarnings("unchecked")
			Map<String, Object> origin = (Map<String, Object>) raw;
			for (Map.Entry<String, Object> e : origin.entrySet()) {
				copy.put(e.getKey(), e.getValue());
			}

			boolean touched = false;
			for (String varName : INTERFERING_VARS) {
				if (copy.remove(varName) != null) {
					touched = true;
					String property = varName.toLowerCase().replace("__", ".");
					System.out.println("[启动预处理] 已剔除环境变量 " + varName
							+ "，使配置文件中的 " + property + " 恢复生效");
				}
			}
			if (!touched) {
				return;
			}

			// 就地替换：先记录原位置，移除旧来源，再按相同顺序插回清理后的副本，
			// 从而完整保留环境变量原有的优先级。
			String name = envSource.getName();
			MapPropertySource sanitized = new MapPropertySource(name, copy);
			env.getPropertySources().replace(name, sanitized);
		});

		app.run(args);
	}
}
