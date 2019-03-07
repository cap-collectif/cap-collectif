<?php

namespace Capco\AppBundle\Command;

use Capco\AppBundle\Entity\Answer;
use Capco\AppBundle\Helper\ConvertCsvToArray;
use Capco\AppBundle\Resolver\UrlResolver;
use Symfony\Bundle\FrameworkBundle\Command\ContainerAwareCommand;
use Symfony\Component\Console\Helper\ProgressBar;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Filesystem\Filesystem;
use Symfony\Component\Security\Core\Exception\UsernameNotFoundException;

class CreateAnswersFromCsvCommand extends ContainerAwareCommand
{
    private $userEmail = 'coucou@cap-collectif.com';
    private $title = 'Réponse du gouvernement';

    protected function configure()
    {
        $this->setName('capco:import:answers-from-csv')->setDescription(
            'Import answers from CSV file'
        );
    }

    protected function execute(InputInterface $input, OutputInterface $output)
    {
        $this->import($input, $output);
    }

    protected function import(InputInterface $input, OutputInterface $output)
    {
        $em = $this->getContainer()
            ->get('doctrine')
            ->getManager();

        $answers = $this->getContainer()
            ->get(ConvertCsvToArray::class)
            ->convert('pjl/answers.csv', '|');
        $author = $this->getContainer()
            ->get('fos_user.user_manager')
            ->findOneBy(['email' => $this->userEmail]);
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
                $object = $this->getContainer()
                    ->get('capco.opinion.repository')
                    ->findOneBy(['slug' => $slug]);
            } elseif ('version' === $type) {
                $object = $this->getContainer()
                    ->get('capco.opinion_version.repository')
                    ->findOneBy(['slug' => $slug]);
            }

            if (!$object) {
                throw new \RuntimeException('Object ' . $type . ' ' . $slug . ' not found.');
            }

            if ($object->getAnswer()) {
                $em->remove($object->getAnswer());
            }

            $object->setAnswer($answer);

            $em->persist($object);

            $em->flush();

            $dump .=
                '<li>' .
                '<a href="' .
                $this->getContainer()
                    ->get(UrlResolver::class)
                    ->getObjectUrl($object, false) .
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
