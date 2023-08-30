<?php

namespace Capco\AppBundle\Command\FeatureToggle;

use Capco\AppBundle\Toggle\Manager;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputArgument;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Style\SymfonyStyle;
use Symfony\Component\Filesystem\Filesystem;
use Symfony\Component\HttpKernel\KernelInterface;

class EnableCommand extends Command
{
    private const SPECIFIC_FEATURE_LIST_FOLDER = '/src/Capco/AppBundle/Command/FeatureToggle/FeatureList/';
    private Manager $toggleManager;
    private KernelInterface $kernel;
    private int $activated = 0;
    private int $deactivated = 0;

    public function __construct(
        ?string $name = null,
        Manager $toggleManager,
        KernelInterface $kernel
    ) {
        parent::__construct($name);
        $this->toggleManager = $toggleManager;
        $this->kernel = $kernel;
    }

    protected function configure(): void
    {
        $this->setName('capco:toggle:enable')
            ->setDescription('Enable a given feature toggle')
            ->addArgument('toggle', InputArgument::OPTIONAL, 'A feature toggle name to activate')
            ->addOption('all')
            ->addOption('minimum')
            ->addOption('file', 'f', InputArgument::OPTIONAL, 'A file containing a list of feature toggles to activate. Located in ./FeatureList Ex: --file=uber')
        ;
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $style = new SymfonyStyle($input, $output);
        $inputToggle = $input->getArgument('toggle');
        $all = $input->getOption('all');
        $minimum = $input->getOption('minimum');
        $fileName = \is_string($input->getOption('file')) ? $input->getOption('file') : null;

        if ($all && 'dev' === $this->kernel->getEnvironment()) {
            $this->toggleManager->activateAll();
            $this->toggleManager->deactivate(Manager::shield_mode);
            $this->toggleManager->deactivate(Manager::graphql_introspection);
            $this->toggleManager->deactivate(Manager::graphql_query_analytics);
            $this->toggleManager->deactivate(Manager::developer_documentation);
            $this->toggleManager->deactivate(Manager::sso_by_pass_auth);
            $style->success('All feature toggles are now enabled for dev environment.');

            return 0;
        }

        if ($fileName) {
            $this->toggleManager->deactivateAll();

            return $this->activateSpecificFeatures($fileName, $output, $style);
        }

        if ($minimum && 'test' === $this->kernel->getEnvironment()) {
            $this->toggleTestFeatures();
            $style->success($this->activated . ' feature toggles have been enabled for test environment.');
            $style->success($this->deactivated . ' feature toggles have been disabled for test environment.');

            return 0;
        }

        if (!$this->toggleManager->exists($inputToggle)) {
            $style->error($inputToggle . ' feature toggle doesn\'t exist...');

            return 1;
        }

        if (!$this->toggleManager->isActive($inputToggle)) {
            $this->toggleManager->activate($inputToggle);
            $style->success($inputToggle . ' feature toggle is now enabled!');

            return 0;
        }

        $style->warning($inputToggle . ' feature toggle is already active!');

        return 0;
    }

    /**
     * @return array<array<string, bool|string>>
     */
    private function readTestSnapshotFeatures()
    {
        $filePath = $this->kernel->getProjectDir() . '/features/graphql-api/internal/Query/__snapshots__/Query_featureFlags.js.snap';
        $fileContent = $this->errorHandlingFileReading($filePath);
        $pattern = '/"featureFlags": Array \[.*?\],/s';
        preg_match($pattern, $fileContent, $matches);

        if (!isset($matches[0])) {
            throw new \Exception('Could not find featureFlags in file ' . $filePath);
        }

        $featureFlagsLine = $matches[0];
        $flagStart = strpos($featureFlagsLine, '[');

        if (!$flagStart) {
            throw new \Exception('Could not find featureFlags in file ' . $filePath);
        }

        $cleanedString = trim(substr($featureFlagsLine, $flagStart));

        if (!$cleanedString) {
            throw new \Exception('Could not find featureFlags in file ' . $filePath);
        }

        $cleanedString = $this->errorHandlingPregReplace('/Object\s\{/', '{', $cleanedString);
        $cleanedString = $this->errorHandlingPregReplace('/",\n\s+}/', '"}', $cleanedString);
        $cleanedString = $this->errorHandlingPregReplace('/,\n\s+\],/', ']', $cleanedString);

        $features = json_decode($cleanedString, true);

        if (!\is_array($features)) {
            throw new \Exception('Could not decode featureFlags in file ' . $filePath);
        }

        foreach ($features as $feature) {
            if (!\is_array($feature)) {
                throw new \Exception('Could not decode featureFlags in file ' . $filePath);
            }

            foreach ($feature as $key => $value) {
                if (!\is_string($key) || (!\is_string($value) && !\is_bool($value))) {
                    throw new \Exception('Could not decode featureFlags in file ' . $filePath);
                }
            }
        }

        // @var array<array<string,string|bool>> $features
        return $features;
    }

    private function errorHandlingFileReading(string $filePath): string
    {
        $fileHandle = fopen($filePath, 'r');
        if (!$fileHandle || !filesize($filePath)) {
            throw new \Exception('Could not open file ' . $filePath);
        }

        $fileContent = fread($fileHandle, filesize($filePath));

        if (!$fileContent) {
            throw new \Exception('Could not read file ' . $filePath);
        }

        fclose($fileHandle);

        return $fileContent;
    }

    private function errorHandlingPregReplace(string $pattern, string $replacement, string $subject): string
    {
        $result = preg_replace($pattern, $replacement, $subject);
        if (null === $result) {
            throw new \Exception('Could not replace ' . $pattern . ' with ' . $replacement . ' in ' . $subject);
        }

        return $result;
    }

    private function activateSpecificFeatures(string $fileName, OutputInterface $output, SymfonyStyle $style): int
    {
        if (!str_ends_with($fileName, '.json')) {
            $fileName = $fileName . '.json';
        }

        $fs = new Filesystem();
        $file = $this->kernel->getProjectDir() . self::SPECIFIC_FEATURE_LIST_FOLDER . $fileName;
        if (!$fs->exists($file)) {
            $output->writeln('<error>File ' . $file . ' does not exist.</error>');

            return 1;
        }

        $featuresToActivate = json_decode($this->errorHandlingFileReading($file), true);
        if (!\is_array($featuresToActivate)) {
            throw new \Exception('Could not decode json from file ' . $file);
        }

        foreach (array_keys($featuresToActivate) as $flagName) {
            $this->toggleManager->activate($flagName);
        }
        $number = \count($featuresToActivate);

        $style->success("All {$number} feature toggles from {$file} are now enabled for this environment.");

        return 1;
    }

    private function toggleTestFeatures(): void
    {
        $featureFlags = $this->readTestSnapshotFeatures();

        foreach ($featureFlags as $flag) {
            if (true === $flag['enabled']) {
                $this->toggleManager->activate($flag['type']);
                ++$this->activated;
            } else {
                $this->toggleManager->deactivate($flag['type']);
                ++$this->deactivated;
            }
        }
    }
}
