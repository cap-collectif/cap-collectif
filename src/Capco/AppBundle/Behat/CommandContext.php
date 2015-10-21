<?php

namespace Capco\AppBundle\Behat;

use Behat\Gherkin\Node\PyStringNode;
use Behat\Symfony2Extension\Context\KernelDictionary;
use Behat\Symfony2Extension\Context\KernelAwareContext;
use Symfony\Bundle\FrameworkBundle\Console\Application;
use Symfony\Component\Console\Input\ArrayInput;
use Symfony\Component\Console\Input\StringInput;
use Symfony\Component\Console\Output\StreamOutput;
use Symfony\Component\Console\Output\NullOutput;

class CommandContext implements KernelAwareContext
{
    use KernelDictionary;

    private $output;
    private $statusCode;

    /**
     * @Given I run :string
     */
    public function iRun($string)
    {
        $this->run($string);
    }

    /**
     * @Given I run a command :command with parameters:
     */
    public function runCommandWithParameters($command, PyStringNode $parameters)
    {
        $commandParameters = json_decode($parameters, true);

        if (null === $commandParameters) {
            throw new \InvalidArgumentException(
                'PyStringNode could not be converted to json.'
            );
        }

        $this->run($command, $commandParameters);
    }

    /**
     * @Then the command exit code should be :code
     */
    public function exitCodeShouldBe($code)
    {
        \PHPUnit_Framework_Assert::assertEquals(
            intval($code),
            $this->statusCode
        );
    }

    /**
     * @Then I should see :content
     */
    public function iShouldSee($content)
    {
        \PHPUnit_Framework_Assert::assertContains(
            $content,
            $this->output
        );
    }

    private function run($command, $parameters = [])
    {
        $application = new Application($this->kernel);

        if (count($parameters) > 0) {
            $arguments = array_merge(array('command' => $command), $parameters);
            $input = new ArrayInput($arguments);
        } else {
            $input = new StringInput($command);
        }

        $fp = tmpfile();
        // $output = new StreamOutput($fp);

        $this->statusCode = $application->doRun($input, new NullOutput());

        // fseek($fp, 0);
        // $output = '';
        // while (!feof($fp)) {
        //     $output = fread($fp, 4096);
        // }
        // fclose($fp);

        // $this->output = $output;
    }
}
