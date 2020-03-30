<?php

namespace Capco\AppBundle\RedirectionIO;

use Psr\Log\LoggerInterface;
use RedirectionIO\Client\Sdk\Command\CommandInterface;
use RedirectionIO\Client\Sdk\Exception\AgentNotFoundException;
use RedirectionIO\Client\Sdk\Exception\ExceptionInterface;
use RedirectionIO\Client\Sdk\Exception\TimeoutException;

class Client
{
    const VERSION = '0.3.0';

    private $projectKeyDataloader;
    private $connections;
    private $timeout = 20000;
    private $debug;
    private $logger;
    private $currentConnection;
    private $currentConnectionName;

    /**
     * @param ProjectKeyDataloader $projectKeyDataloader
     * @param LoggerInterface $logger
     * @param int $timeout
     * @param string $agentTcp
     * @param string $agentUnix
     * @param bool $debug
     */
    public function __construct(ProjectKeyDataloader $projectKeyDataloader, LoggerInterface $logger,
                                $timeout, string $agentTcp, string $agentUnix, $debug = false)
    {
        $connections = [
            'agent_tcp' => $agentTcp,
            'agent_unix' => $agentUnix,
        ];

        foreach ($connections as $name => $connection) {
            $this->connections[$name] = [
                'remote_socket' => $connection,
                'retries' => 2,
            ];
        }

        $this->projectKeyDataloader = $projectKeyDataloader;
        $this->timeout = $timeout;
        $this->debug = $debug;
        $this->logger = $logger;
    }

    public function request(CommandInterface $command)
    {
        $projectKey = $this->projectKeyDataloader->loadKey();
        $command->setProjectKey($projectKey);

        try {
            return $this->doRequest($command);
        } catch (ExceptionInterface $exception) {
            if ($this->debug) {
                throw $exception;
            }

            return null;
        }
    }

    private function doRequest(CommandInterface $command)
    {
        $connection = $this->getConnection();

        $toSend = $command->getName() . "\0" . $command->getRequest() . "\0";
        $sent = $this->box('doSend', false, [$connection, $toSend]);

        if (false === $sent) {
            $this->logger->debug('Impossible to send content to the connection.', [
                'options' => $this->connections[$this->currentConnectionName],
            ]);

            --$this->connections[$this->currentConnectionName]['retries'];
            $this->currentConnection = null;
            $this->box('disconnect', null, [$connection]);

            return $this->doRequest($command);
        }

        if (!$command->hasResponse()) {
            return null;
        }

        $received = $this->box('doGet', false, [$connection]);

        // false: the persistent connection is stale
        if (false === $received) {
            $this->logger->debug('Impossible to get content from the connection.', [
                'options' => $this->connections[$this->currentConnectionName],
            ]);

            --$this->connections[$this->currentConnectionName]['retries'];
            $this->currentConnection = null;
            $this->box('disconnect', null, [$connection]);

            return $this->doRequest($command);
        }

        if (feof($connection)) {
            $this->box('disconnect', null, [$connection]);
            $this->currentConnection = null;
        }

        return $command->parseResponse(trim($received));
    }

    private function getConnection()
    {
        if (null !== $this->currentConnection) {
            return $this->currentConnection;
        }

        foreach ($this->connections as $name => $connection) {
            if ($connection['retries'] <= 0) {
                continue;
            }

            $this->logger->debug('New connection chosen. Trying to connect.', [
                'connection' => $connection,
                'name' => $name,
            ]);

            $connection = $this->box('doConnect', false, [$connection]);

            if (false === $connection) {
                $this->logger->debug('Impossible to connect to the connection.', [
                    'connection' => $connection,
                    'name' => $name,
                ]);

                $this->connections[$name]['retries'] = 0;

                continue;
            }

            $this->logger->debug('New connection approved.', [
                'connection' => $connection,
                'name' => $name,
            ]);

            stream_set_timeout($connection, 0, $this->timeout);

            $this->currentConnection = $connection;
            $this->currentConnectionName = $name;

            return $connection;
        }

        $this->logger->error('Can not find an agent.', [
            'connections_options' => $this->connections,
        ]);

        throw new AgentNotFoundException();
    }

    private function doConnect($options)
    {
        if (\PHP_VERSION_ID >= 70100) {
            $context = stream_context_create([
                'socket' => [
                    'tcp_nodelay' => true,
                ],
            ]);
        } else {
            $context = stream_context_create();
        }

        $connection = stream_socket_client(
            $options['remote_socket'],
            $errNo,
            $errMsg,
            1, // This value is not used but it should not be 0
            STREAM_CLIENT_CONNECT | STREAM_CLIENT_PERSISTENT,
            $context
        );

        stream_set_blocking($connection, 0);

        return $connection;
    }

    private function disconnect($connection)
    {
        fclose($connection);
    }

    private function doSend($connection, $content)
    {
        return $this->fwrite($connection, $content);
    }

    private function doGet($connection)
    {
        $buffer = '';

        while (true) {
            if (feof($connection)) {
                return false;
            }

            $reads = $write = $except = [];
            $reads[] = $connection;
            $modified = stream_select($reads, $write, $except, 0, 200000);

            // Timeout
            if (0 === $modified) {
                throw new TimeoutException('Timeout reached when trying to read stream (' . $this->timeout . 'ms)');
            }

            // Error
            if (false === $modified) {
                return false;
            }

            $content = stream_get_contents($connection);
            $buffer .= $content;
            $endingPos = strpos($buffer, "\0");

            if (false !== $endingPos) {
                return substr($buffer, 0, $endingPos);
            }
        }
    }

    private function box($method, $defaultReturnValue = null, array $args = [])
    {
        set_error_handler(__CLASS__ . '::handleInternalError');

        try {
            $returnValue = \call_user_func_array([$this, $method], $args);
        } catch (\ErrorException $exception) {
            $returnValue = $defaultReturnValue;

            $this->logger->warning('Impossible to execute a boxed call.', [
                'method' => $method,
                'default_return_value' => $defaultReturnValue,
                'args' => $args,
                'exception' => $exception,
            ]);
        } finally {
            restore_error_handler();
        }

        return $returnValue;
    }

    private static function handleInternalError($type, $message, $file, $line)
    {
        throw new \ErrorException($message, 0, $type, $file, $line);
    }

    /**
     * Replace fwrite behavior as API is broken in PHP.
     *
     * @see https://secure.phabricator.com/rPHU69490c53c9c2ef2002bc2dd4cecfe9a4b080b497
     *
     * @param resource $stream The stream resource
     * @param string $bytes Bytes written in the stream
     *
     * @return bool|int false if pipe is broken, number of bytes written otherwise
     */
    private function fwrite($stream, $bytes)
    {
        if (!\strlen($bytes)) {
            return 0;
        }
        $result = @fwrite($stream, $bytes);
        if (0 !== $result) {
            // In cases where some bytes are witten (`$result > 0`) or
            // an error occurs (`$result === false`), the behavior of fwrite() is
            // correct. We can return the value as-is.
            return $result;
        }
        // If we make it here, we performed a 0-length write. Try to distinguish
        // between EAGAIN and EPIPE. To do this, we're going to `stream_select()`
        // the stream, write to it again if PHP claims that it's writable, and
        // consider the pipe broken if the write fails.
        $read = [];
        $write = [$stream];
        $except = [];
        @stream_select($read, $write, $except, 0);
        if (!$write) {
            // The stream isn't writable, so we conclude that it probably really is
            // blocked and the underlying error was EAGAIN. Return 0 to indicate that
            // no data could be written yet.
            return 0;
        }
        // If we make it here, PHP **just** claimed that this stream is writable, so
        // perform a write. If the write also fails, conclude that these failures are
        // EPIPE or some other permanent failure.
        $result = @fwrite($stream, $bytes);
        if (0 !== $result) {
            // The write worked or failed explicitly. This value is fine to return.
            return $result;
        }
        // We performed a 0-length write, were told that the stream was writable, and
        // then immediately performed another 0-length write. Conclude that the pipe
        // is broken and return `false`.
        return false;
    }
}
