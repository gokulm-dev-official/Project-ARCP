package com.smartambulance.config;

import org.springframework.amqp.core.*;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * RabbitMQ configuration for async message processing.
 * Exchanges and queues for location updates and alert broadcasts.
 */
@Configuration
public class RabbitMQConfig {

    public static final String LOCATION_EXCHANGE = "location.exchange";
    public static final String LOCATION_QUEUE = "location.queue";
    public static final String LOCATION_ROUTING_KEY = "location.update";

    public static final String ALERT_EXCHANGE = "alert.exchange";
    public static final String ALERT_QUEUE = "alert.queue";
    public static final String ALERT_ROUTING_KEY = "alert.broadcast";

    // Location exchange & queue
    @Bean
    public TopicExchange locationExchange() {
        return new TopicExchange(LOCATION_EXCHANGE);
    }

    @Bean
    public Queue locationQueue() {
        return QueueBuilder.durable(LOCATION_QUEUE).build();
    }

    @Bean
    public Binding locationBinding(Queue locationQueue, TopicExchange locationExchange) {
        return BindingBuilder.bind(locationQueue).to(locationExchange).with(LOCATION_ROUTING_KEY);
    }

    // Alert exchange & queue
    @Bean
    public TopicExchange alertExchange() {
        return new TopicExchange(ALERT_EXCHANGE);
    }

    @Bean
    public Queue alertQueue() {
        return QueueBuilder.durable(ALERT_QUEUE).build();
    }

    @Bean
    public Binding alertBinding(Queue alertQueue, TopicExchange alertExchange) {
        return BindingBuilder.bind(alertQueue).to(alertExchange).with(ALERT_ROUTING_KEY);
    }

    @Bean
    public MessageConverter jsonMessageConverter() {
        return new Jackson2JsonMessageConverter();
    }

    @Bean
    public RabbitTemplate rabbitTemplate(ConnectionFactory connectionFactory) {
        RabbitTemplate rabbitTemplate = new RabbitTemplate(connectionFactory);
        rabbitTemplate.setMessageConverter(jsonMessageConverter());
        return rabbitTemplate;
    }
}
