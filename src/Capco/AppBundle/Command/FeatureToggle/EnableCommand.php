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

    protected function configure()
    {
        $this->setName('capco:toggle:enable')
            ->setDescription('Enable a given feature toggle')
            ->addArgument('toggle', InputArgument::OPTIONAL, 'A feature toggle name to activate')
            ->addOption('all')
            ->addOption('test')
        ;
    }

    protected function execute(InputInterface $input, OutputInterface $output)
    {
        $style = new SymfonyStyle($input, $output);
        $inputToggle = $input->getArgument('toggle');
        $all = $input->getOption('all');
        $test = $input->getOption('test');

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

        if ($test) {
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

    private function readTestSnapshotFeatures(): array
    {
        /** @var FileSystem $fileSystem */
        $filePath = $this->kernel->getProjectDir() . '/features/graphql-api/internal/Query/__snapshots__/Query_featureFlags.js.snap';
        $fileHandle = fopen($filePath, 'r');
        $fileContent = fread($fileHandle, filesize($filePath));
        fclose($fileHandle);
        $pattern = '/"featureFlags": Array \[.*?\],/s';
        preg_match($pattern, $fileContent, $matches);
        $featureFlagsLine = $matches[0];

        $cleanedString = trim(substr($featureFlagsLine, strpos($featureFlagsLine, '[')));
        $cleanedString = preg_replace('/Object\s\{/', '{', $cleanedString);
        $cleanedString = preg_replace('/",\n\s+}/', '"}', $cleanedString);
        $cleanedString = preg_replace('/,\n\s+\],/', ']', $cleanedString);

        return json_decode($cleanedString, true);
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
