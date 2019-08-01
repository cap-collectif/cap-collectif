<?php

namespace Capco\AppBundle\Behat;

use Behat\Gherkin\Node\PyStringNode;
use Behat\Symfony2Extension\Context\KernelAwareContext;
use Behat\Symfony2Extension\Context\KernelDictionary;
use Symfony\Bundle\FrameworkBundle\Console\Application;
use Symfony\Component\Console\Input\ArrayInput;
use Symfony\Component\Console\Input\StringInput;
use Symfony\Component\Console\Output\StreamOutput;
use PHPUnit\Framework\Assert;

class CommandContext implements KernelAwareContext
{
    use KernelDictionary;

    private $output;
    private $statusCode;

    /**
     * @Given I run :string
     *
     * @param mixed $string
     */
    public function iRun($string)
    {
        $this->run($string);
    }

    /**
     * @Given I consume :queue
     * @Given I consume :maxMessage messages in :queue
     *
     * @param mixed $maxMessage
     */
    public function iConsume(string $queue, $maxMessage = 1)
    {
        $this->run(
            'swarrot:consume:' .
                $queue .
                ' ' .
                $queue .
                ' --env=test --max-execution-time=10 --max-messages=' .
                $maxMessage
        );
    }

    /**
     * @Given I run a command :command with parameters:
     *
     * @param mixed $command
     */
    public function runCommandWithParameters($command, PyStringNode $parameters)
    {
        $commandParameters = json_decode($parameters, true);

        if (null === $commandParameters) {
            throw new \InvalidArgumentException('PyStringNode could not be converted to json.');
        }

        $this->run($command, $commandParameters);
    }

    /**
     * @Then the command exit code should be :code
     *
     * @param mixed $code
     */
    public function exitCodeShouldBe($code)
    {
        Assert::assertEquals((int) $code, $this->statusCode);
    }

    /**
     * @Then I should see :content in output
     *
     * @param mixed $content
     */
    public function iShouldSee($content)
    {
        Assert::assertContains($content, $this->output);
    }

    private function run($command, $parameters = [])
    {
        $application = new Application($this->kernel);
        $application
            ->getKernel()
            ->getContainer()
            ->get('overblog_graphql.cache_compiler')
            ->loadClasses(true);
        if (\count($parameters) > 0) {
            $arguments = array_merge(['command' => $command], $parameters);
            $input = new ArrayInput($arguments);
        } else {
            $input = new StringInput($command);
        }

        $input->setInteractive(false);

        $fp = tmpfile();
        $output = new StreamOutput($fp);

        $this->statusCode = $application->doRun($input, $output);

        fseek($fp, 0);
        $output = '';
        while (!feof($fp)) {
            $output = fread($fp, 4096);
        }
        fclose($fp);

        $this->output = $output;
    }
}
