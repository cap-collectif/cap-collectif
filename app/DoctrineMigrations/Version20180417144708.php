<?php

namespace Application\Migrations;

use Capco\AppBundle\Entity\CommentVote;
use Capco\AppBundle\Entity\Idea;
use Capco\AppBundle\Entity\Project;
use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\Entity\ProposalCollectVote;
use Capco\AppBundle\Entity\ProposalComment;
use Capco\AppBundle\Entity\ProposalForm;
use Capco\AppBundle\Entity\Steps\CollectStep;
use Capco\AppBundle\Entity\Steps\ProjectAbstractStep;
use Capco\AppBundle\Traits\VoteTypeTrait;
use Capco\UserBundle\Entity\User;
use Doctrine\DBAL\Migrations\AbstractMigration;
use Doctrine\DBAL\Schema\Schema;
use Doctrine\ORM\EntityManager;
use Symfony\Component\Console\Helper\ProgressBar;
use Symfony\Component\Console\Output\ConsoleOutput;
use Symfony\Component\DependencyInjection\ContainerAwareInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
class Version20180417144708 extends AbstractMigration implements ContainerAwareInterface
{
    private $container;

    public function setContainer(ContainerInterface $container = null)
    {
        $this->container = $container;
    }

    public function postUp(Schema $schema)
    {
        $em = $this->container->get('doctrine.orm.entity_manager');

        //create project
        $this->write('-> create project boite à idées');
        $collectStep = (new CollectStep())
            ->setTitle('Dépôt')
            ->setLabel('Dépôt')
            ->setStartAt(new \DateTime('now'))
            ->setEndAt(new \DateTime('+ 30 days'))
            ->setVoteType(VoteTypeTrait::$VOTE_TYPE_SIMPLE);

        $project = (new Project())
            ->setTitle('Boîte à idées')
            ->setIsEnabled(true)
            ->setAuthor($em->getRepository(User::class)->findOneBy(['email' => 'admin@cap-collectif.com']))
            ->setCreatedAt(new \DateTime('now'))
            ->setPublishedAt(new \DateTime('now'))
            ->setUpdatedAt(new \DateTime('now'));

        $project->addStep(
            (new ProjectAbstractStep())
                ->setProject($project)
                ->setStep($collectStep)
                ->setPosition(1)
        );

        $em->persist($project);

        //create proposalForm
        $this->write('-> create proposalForm');
        $proposalForm = (new ProposalForm())
            ->setTitle('Boîte à idées')
            ->setDescription('Partagez vos idées !')
            ->setStep($project->getSteps()[0]->getStep());

        $em->persist($proposalForm);

        //import ideas into proposals
        $this->write('-> import ideas into proposals');
        $this->importIdeas($em,$proposalForm);
        
        $em->flush();
    }

    public function importIdeas(EntityManager $em, ProposalForm $proposalForm ) {
        
        $output = new ConsoleOutput();
        $ideas = $em->getRepository(Idea::class)->findAll();
        $progress = new ProgressBar($output, \count($ideas));

        foreach($ideas as $idea) {
            $proposal = (new Proposal())
                ->setProposalForm($proposalForm)
                ->setTitle($idea->getTitle())
                ->setAuthor($idea->getAuthor())
                ->setEnabled($idea->getIsEnabled())
                ->setIsTrashed($idea->getIsTrashed())
                ->setBody($idea->getBody())
                ->setTheme($idea->getTheme())
                ->setCreatedAt($idea->getCreatedAt())
                ->setUpdatedAt($idea->getUpdatedAt());

                if($idea->getMedia()){
                    $proposal->setMedia($idea->getMedia());
                }

                foreach ($idea->getVotes() as $ideaVote) {
                    $vote = (new ProposalCollectVote())
                        ->setProposal($proposal)
                        ->setCreatedAt($ideaVote->getCreatedAt())
                        ->setUser($ideaVote->getUser())
                    ;
                    
                    $em->persist($vote);
                }

                //import commentaires des ideas 
                foreach ($idea->getComments() as $ideaComment) {
                    $proposalComment = (new ProposalComment())
                        ->setAuthor($ideaComment->getAuthor())
                        ->setAuthorName($ideaComment->getAuthorName())
                        ->setAuthorEmail($ideaComment->getAuthorEmail())
                        ->setAuthorIp($ideaComment->getAuthorIp())
                        ->setProposal($proposal)
                        ->setIsEnabled($ideaComment->getIsEnabled())
                        ->setIsTrashed($ideaComment->getIsTrashed())
                        ->setPinned($ideaComment->isPinned())
                        ->setValidated($ideaComment->isValidated())
                        ->setCreatedAt($ideaComment->getCreatedAt())
                        ->setVotesCount($ideaComment->getVotesCount())
                        ->setUpdatedAt($ideaComment->getUpdatedAt())
                        ->setBody($ideaComment->getBody());

                    if($ideaComment->getAnswers()) {
                        foreach ($ideaComment->getAnswers() as $ideaAnswer) {
                            $answer = (new ProposalComment())
                                ->setAuthor($ideaAnswer->getAuthor())
                                ->setAuthorName($ideaAnswer->getAuthorName())
                                ->setAuthorEmail($ideaAnswer->getAuthorEmail())
                                ->setAuthorIp($ideaAnswer->getAuthorIp())
                                ->setProposal($proposal)
                                ->setIsEnabled($ideaAnswer->getIsEnabled())
                                ->setIsTrashed($ideaAnswer->getIsTrashed())
                                ->setPinned($ideaAnswer->isPinned())
                                ->setValidated($ideaAnswer->isValidated())
                                ->setCreatedAt($ideaAnswer->getCreatedAt())
                                ->setVotesCount($ideaAnswer->getVotesCount())
                                ->setUpdatedAt($ideaAnswer->getUpdatedAt())
                                ->setParent($proposalComment)
                                ->setBody($ideaAnswer->getBody());

                            $proposalComment->addAnswer($answer);
                        }
                    }

                    //votes commentaires
                    foreach ($ideaComment->getVotes() as $ideaCommentVote) {
                        $commentVote = (new CommentVote())
                            ->setComment($proposalComment)
                            ->setCreatedAt($ideaCommentVote->getCreatedAt())
                            ->setUser($ideaCommentVote->getUser())
                        ;

                        $em->persist($commentVote);
                    }

                    $em->persist($proposalComment);
                }

            $em->persist($proposal);

            $progress->advance();
        }

    }

    public function postDown(Schema $schema)
    {

    }

    /**
     * @param Schema $schema
     */
    public function up(Schema $schema)
    {
        // this up() migration is auto-generated, please modify it to your needs

    }

    /**
     * @param Schema $schema
     */
    public function down(Schema $schema)
    {
        // this down() migration is auto-generated, please modify it to your needs

    }
}
