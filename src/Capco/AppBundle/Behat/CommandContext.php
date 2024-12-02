<?php

namespace Capco\AppBundle\Behat;

use Behat\Gherkin\Node\TableNode;
use Behat\Symfony2Extension\Context\KernelAwareContext;
use Behat\Symfony2Extension\Context\KernelDictionary;
use PHPUnit\Framework\Assert;
use Symfony\Bundle\FrameworkBundle\Console\Application;
use Symfony\Component\Console\Input\ArrayInput;
use Symfony\Component\Console\Input\StringInput;
use Symfony\Component\Console\Output\StreamOutput;

class CommandContext implements KernelAwareContext
{
    use KernelDictionary;

    private $output;
    private $statusCode;

    /**
     * @Given I run :string
     */
    public function iRun(mixed $string)
    {
        $this->run($string);
    }

    /**
     * @Given I consume :queue
     * @Given I consume :maxMessage messages in :queue
     */
    public function iConsume(string $queue, mixed $maxMessage = 1)
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
     */
    public function runCommandWithParameters(mixed $command, TableNode $parameters)
    {
        $options = [];
        foreach ($parameters->getRowsHash() as $key => $value) {
            $options[$key] = $value;
        }

        $this->run($command, $options);
    }

    /**
     * @Then the command exit code should be :code
     */
    public function exitCodeShouldBe(mixed $code)
    {
        Assert::assertEquals((int) $code, $this->statusCode);
    }

    /**
     * @Then I should see :content in output
     */
    public function iShouldSee(string $content): void
    {
        Assert::assertStringContainsString($content, $this->output);
    }

    private function run($command, $parameters = [])
    {
        $application = new Application($this->kernel);
        $application
            ->getKernel()
            ->getContainer()
            ->get('overblog_graphql.cache_compiler')
            ->loadClasses(true)
        ;
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
