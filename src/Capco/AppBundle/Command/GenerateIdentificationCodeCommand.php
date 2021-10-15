<?php

namespace Capco\AppBundle\Command;

use Box\Spout\Common\Type;
use Box\Spout\Writer\Common\Creator\WriterEntityFactory;
use Capco\AppBundle\Entity\UserIdentificationCode;
use Capco\AppBundle\Repository\UserIdentificationCodeRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\ORM\EntityManagerInterface;
use Psr\Log\LoggerInterface;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Helper\ProgressBar;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Input\InputOption;
use Symfony\Component\Console\Output\OutputInterface;

class GenerateIdentificationCodeCommand extends Command
{
    private const CODE_MAX_LENGTH = 8;
    private const COMMAND_NAME = 'capco:generate:identification_code';
    private string $projectRootDir;
    private LoggerInterface $logger;
    private EntityManagerInterface $em;
    private UserIdentificationCodeRepository $userIdentificationCodeRepository;

    public function __construct(
        EntityManagerInterface $em,
        string $projectRootDir,
        LoggerInterface $logger,
        UserIdentificationCodeRepository $userIdentificationCodeRepository
    ) {
        parent::__construct(self::COMMAND_NAME);
        $this->em = $em;
        $this->projectRootDir = $projectRootDir;
        $this->logger = $logger;
        $this->userIdentificationCodeRepository = $userIdentificationCodeRepository;
    }

    public function createUniqCodes(
        int $numberOfCodesToGenerate,
        ProgressBar $progress
    ): ArrayCollection {
        $existingCodes = $this->userIdentificationCodeRepository->findAll();
        $existingIdentificationCode = array_map(function (UserIdentificationCode $existingCode) {
            return $existingCode->getIdentificationCode();
        }, $existingCodes);
        $newUserIdentificationCodes = new ArrayCollection();

        for ($i = 0; $i < $numberOfCodesToGenerate; ++$i) {
            $newUserIdentificationCode = $this->makeAUserIdentificationCode();
            $userIdentificationCode = $this->checkIfCodeIsValid(
                $newUserIdentificationCode,
                $newUserIdentificationCodes,
                $existingIdentificationCode
            );
            $this->em->persist($userIdentificationCode);
            $newUserIdentificationCodes->add($userIdentificationCode);
            $progress->advance();
            // code creation could be long and loose connection to dbb. So, flush every 1000 new UserIdentificationCode, help to keep alive dbb connection
            if ($i % 1000) {
                $this->em->flush();
            }
        }
        $this->em->flush();

        return $newUserIdentificationCodes;
    }

    public function checkIfCodeIsValid(
        UserIdentificationCode $newUserIdentificationCode,
        ArrayCollection $newUserIdentificationCodes,
        array $existingCodes
    ): UserIdentificationCode {
        $newUserIdentificationCode = $this->checkIfExistInBdd(
            $newUserIdentificationCode,
            $existingCodes
        );

        return $this->checkIfExistingInGenerated(
            $newUserIdentificationCode,
            $newUserIdentificationCodes
        );
    }

    public function checkIfExistInBdd(
        UserIdentificationCode $newUserIdentificationCode,
        array $existingCodes
    ): UserIdentificationCode {
        if (\in_array($newUserIdentificationCode->getidentificationCode(), $existingCodes)) {
            $this->logger->notice(
                sprintf(
                    'code %s already exist in database',
                    $newUserIdentificationCode->getIdentificationCode()
                )
            );
            $newUserIdentificationCode = $this->makeAUserIdentificationCode();
            $this->checkIfExistInBdd($newUserIdentificationCode, $existingCodes);
        }

        return $newUserIdentificationCode;
    }

    public function checkIfExistingInGenerated(
        UserIdentificationCode $newUserIdentificationCode,
        ArrayCollection $newUserIdentificationCodes
    ): UserIdentificationCode {
        $newUserIdentificationCodes->map(function (
            UserIdentificationCode $userIdentificationCode
        ) use ($newUserIdentificationCode, $newUserIdentificationCodes) {
            if (
                $userIdentificationCode->getIdentificationCode() ===
                $newUserIdentificationCode->getIdentificationCode()
            ) {
                $this->logger->notice(
                    sprintf(
                        'code %s already exist in just generated codes',
                        $newUserIdentificationCode->getIdentificationCode()
                    )
                );
                $newUserIdentificationCode = $this->makeAUserIdentificationCode();
                $this->checkIfExistingInGenerated(
                    $newUserIdentificationCode,
                    $newUserIdentificationCodes
                );
            }
        });

        return $newUserIdentificationCode;
    }

    public function createCsvFileContainingTheGeneratedCodes(
        ArrayCollection $codes,
        string $delimiter,
        string $fileName,
        OutputInterface $output
    ): void {
        $header = ['verification_code'];
        $writer = WriterFactory::create(Type::CSV, $delimiter);
        $writer->openToFile($fileName);
        $writer->addRow(WriterEntityFactory::createRowFromArray($header));

        /** @var UserIdentificationCode $userIdentificationCode */
        foreach ($codes as $userIdentificationCode) {
            $writer->addRow(
                WriterEntityFactory::createRowFromArray([
                    $userIdentificationCode->getIdentificationCode(),
                ])
            );
        }
        $writer->close();
        $output->writeln(\PHP_EOL . 'The file "' . $fileName . '" has been created.');
    }

    protected function configure(): void
    {
        $this->setDescription('Generate identification code and create csv');
        $this->addOption(
            'number',
            'num',
            InputOption::VALUE_OPTIONAL,
            'Number of code to generate',
            100
        );
        $this->addOption(
            'delimiter',
            'd',
            InputOption::VALUE_OPTIONAL,
            'Delimiter used in csv',
            ';'
        );
    }

    protected function execute(InputInterface $input, OutputInterface $output)
    {
        $delimiter = $input->getOption('delimiter');
        $numberOfCodesToGenerate = $input->getOption('number');
        $progress = new ProgressBar($output, $numberOfCodesToGenerate);

        $codes = $this->createUniqCodes($numberOfCodesToGenerate, $progress);
        $fileName = 'generated_codes_' . (new \DateTime())->format('YmdHis') . '.csv';
        $fileName = sprintf('%s/public/export/%s', $this->projectRootDir, $fileName);
        $this->createCsvFileContainingTheGeneratedCodes($codes, $delimiter, $fileName, $output);
        $progress->finish();

        return 0;
    }

    private function makeAUserIdentificationCode(): UserIdentificationCode
    {
        $userIdentificationCode = strtoupper(
            substr(md5(uniqid(mt_rand(), true)), 0, self::CODE_MAX_LENGTH)
        );

        return (new UserIdentificationCode())->setIdentificationCode($userIdentificationCode);
    }
}
