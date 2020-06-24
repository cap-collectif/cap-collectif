<?php

namespace Capco\AppBundle\Command;

use Capco\AppBundle\Entity\Answer;
use Capco\AppBundle\Helper\ConvertCsvToArray;
use Capco\AppBundle\Repository\OpinionRepository;
use Capco\AppBundle\Repository\OpinionVersionRepository;
use Capco\AppBundle\Resolver\UrlResolver;
use Capco\UserBundle\Doctrine\UserManager;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Helper\ProgressBar;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Filesystem\Filesystem;
use Symfony\Component\Security\Core\Exception\UsernameNotFoundException;

class CreateAnswersFromCsvCommand extends Command
{
    private $userEmail = 'coucou@cap-collectif.com';
    private $title = 'Réponse du gouvernement';

    private EntityManagerInterface $em;
    private ConvertCsvToArray $convertCsvToArray;
    private UserManager $userManager;
    private OpinionRepository $opinionRepository;
    private OpinionVersionRepository $opinionVersionRepository;
    private UrlResolver $urlResolver;

    public function __construct(
        ?string $name,
        EntityManagerInterface $em,
        ConvertCsvToArray $convertCsvToArray,
        UserManager $userManager,
        OpinionRepository $opinionRepository,
        OpinionVersionRepository $opinionVersionRepository,
        UrlResolver $urlResolver
    ) {
        parent::__construct($name);
        $this->em = $em;
        $this->convertCsvToArray = $convertCsvToArray;
        $this->userManager = $userManager;
        $this->opinionVersionRepository = $opinionVersionRepository;
        $this->opinionRepository = $opinionRepository;
        $this->urlResolver = $urlResolver;
    }

    protected function configure()
    {
        $this->setName('capco:import:answers-from-csv')->setDescription(
            'Import answers from CSV file'
        );
    }

    protected function execute(InputInterface $input, OutputInterface $output)
    {
        $this->import($input, $output);

        return 0;
    }

    protected function import(InputInterface $input, OutputInterface $output)
    {
        $answers = $this->convertCsvToArray->convert('pjl/answers.csv', '|');
        $author = $this->userManager->findOneBy(['email' => $this->userEmail]);
        if (!$author) {
            throw new UsernameNotFoundException('Author email does not exist in db');
        }

        $progress = new ProgressBar($output, \count($answers));
        $progress->start();

        $dump = '<ul>';

        foreach ($answers as $row) {
            $answer = new Answer();
            $answer->setAuthor($author);
            $answer->setTitle($this->title);
            $answer->setBody($row['body']);

            $slug = $row['slug'];
            $slug = explode('/', $slug);
            $slug = $slug[\count($slug) - 1];

            $type = \in_array('versions', explode('/', $row['slug']), true) ? 'version' : 'opinion';
            $object = null;
            if ('opinion' === $type) {
                $object = $this->opinionRepository->findOneBy(['slug' => $slug]);
            } elseif ('version' === $type) {
                $object = $this->opinionVersionRepository->findOneBy(['slug' => $slug]);
            }

            if (!$object) {
                throw new \RuntimeException('Object ' . $type . ' ' . $slug . ' not found.');
            }

            if ($object->getAnswer()) {
                $this->em->remove($object->getAnswer());
            }

            $object->setAnswer($answer);
            $this->em->persist($object);
            $this->em->flush();

            $dump .=
                '<li>' .
                '<a href="' .
                $this->urlResolver->getObjectUrl($object, false) .
                '">' .
                $object->getAuthor()->getUsername() .
                ' - ' .
                $object->getTitle() .
                '</a>' .
                '</li>';
            $progress->advance(1);
        }

        $dump .= '</ul>';

        (new Filesystem())->dumpFile('answers_list.html', $dump);

        $progress->finish();

        $output->writeln(\count($answers) . ' answers have been created !');
    }
}
